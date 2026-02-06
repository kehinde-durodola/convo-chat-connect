import { DeletedFor, MessageStatus } from "@prisma/client";
import { messageRepository } from "../repositories/message.repository.js";
import { participantRepository } from "../repositories/participant.repository.js";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { PaginatedMessages } from "../types/index.js";

export async function getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    cursor?: string
): Promise<PaginatedMessages> {
    const participant = await participantRepository.findByUserAndConversation(userId, conversationId);
    if (!participant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    const messages = await messageRepository.findByConversation(conversationId, limit, cursor);

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1]?.id : null;

    await participantRepository.resetUnreadCount(userId, conversationId);

    return {
        messages: resultMessages,
        nextCursor,
        hasMore,
    };
}

export async function sendMessage(
    conversationId: string,
    senderId: string,
    text?: string,
    imageUrl?: string
) {
    const participant = await participantRepository.findByUserAndConversation(senderId, conversationId);
    if (!participant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    const message = await messageRepository.create({
        conversationId,
        senderId,
        text: text || null,
        imageUrl: imageUrl || null,
        status: MessageStatus.sent,
    });

    await conversationRepository.updateTimestamp(conversationId);
    await participantRepository.incrementUnreadCount(conversationId, senderId);

    return message;
}

export async function markMessageAsRead(messageId: string, userId: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
        throw new NotFoundError("Message not found");
    }

    if (message.senderId === userId) {
        return message;
    }

    const participant = await participantRepository.findByUserAndConversation(
        userId,
        message.conversationId
    );
    if (!participant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    await messageRepository.updateStatus(messageId, MessageStatus.read);
    await participantRepository.resetUnreadCount(userId, message.conversationId);

    return { ...message, status: MessageStatus.read };
}

export async function markConversationAsRead(conversationId: string, userId: string) {
    const participant = await participantRepository.findByUserAndConversation(userId, conversationId);
    if (!participant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    await messageRepository.markAsRead(conversationId, userId);
    await participantRepository.resetUnreadCount(userId, conversationId);
}

export async function deleteMessage(
    messageId: string,
    userId: string,
    deleteFor: "self" | "everyone"
) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
        throw new NotFoundError("Message not found");
    }

    if (deleteFor === "everyone" && message.senderId !== userId) {
        throw new ForbiddenError("Can only delete your own messages for everyone");
    }

    const deletedFor = deleteFor === "self" ? DeletedFor.self : DeletedFor.everyone;
    await messageRepository.softDelete(messageId, deletedFor);

    return { messageId, conversationId: message.conversationId, deletedFor };
}
