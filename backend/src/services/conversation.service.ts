import { ConversationType } from "@prisma/client";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { participantRepository } from "../repositories/participant.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { ConversationListItem } from "../types/index.js";

export async function getConversationById(id: string, userId: string) {
    const conversation = await conversationRepository.findById(id);
    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    return conversation;
}

export async function getUserConversations(userId: string): Promise<ConversationListItem[]> {
    const conversations = await conversationRepository.findUserConversations(userId);

    return conversations.map((conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const otherParticipant = conv.participants.find((p) => p.userId !== userId);
        const lastMessage = conv.messages[0] || null;

        return {
            id: conv.id,
            type: conv.type as "direct" | "group",
            name: conv.type === ConversationType.group ? conv.name : null,
            icon: conv.icon,
            iconBg: conv.iconBg,
            otherUser:
                conv.type === ConversationType.direct && otherParticipant
                    ? {
                        id: otherParticipant.user.id,
                        name: otherParticipant.user.name,
                        initials: otherParticipant.user.initials,
                        avatarColor: otherParticipant.user.avatarColor,
                        avatarUrl: otherParticipant.user.avatarUrl,
                        bio: otherParticipant.user.bio,
                        username: otherParticipant.user.username,
                        isOnline: otherParticipant.user.isOnline,
                        lastActive: otherParticipant.user.lastActive,
                    }
                    : null,
            lastMessage: lastMessage
                ? {
                    text: lastMessage.text,
                    imageUrl: lastMessage.imageUrl,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId,
                }
                : null,
            unreadCount: participant?.unreadCount || 0,
            updatedAt: conv.updatedAt,
        };
    });
}

export async function createDirectConversation(userId: string, otherUserId: string) {
    const otherUser = await userRepository.findById(otherUserId);
    if (!otherUser) {
        throw new NotFoundError("User not found");
    }

    const existing = await conversationRepository.findDirectConversation(userId, otherUserId);
    if (existing) {
        return { conversation: existing, created: false };
    }

    const conversation = await conversationRepository.create({
        type: ConversationType.direct,
        participants: {
            create: [{ userId }, { userId: otherUserId }],
        },
    });

    return { conversation, created: true };
}

export async function muteConversation(userId: string, conversationId: string, isMuted: boolean) {
    const participant = await participantRepository.findByUserAndConversation(userId, conversationId);
    if (!participant) {
        throw new ForbiddenError("Not a participant of this conversation");
    }

    return participantRepository.updateByUserAndConversation(userId, conversationId, { isMuted });
}
