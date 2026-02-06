import { ConversationType } from "@prisma/client";
import { conversationRepository } from "../repositories/conversation.repository.js";
import { participantRepository } from "../repositories/participant.repository.js";
import { NotFoundError, ConflictError, ForbiddenError } from "../utils/errors.js";
import { GroupListItem } from "../types/index.js";

export async function getGroups(userId: string, search?: string) {
    const groups = await conversationRepository.findGroups(userId, search);

    const joined: GroupListItem[] = [];
    const discover: GroupListItem[] = [];

    groups.forEach((group) => {
        const item: GroupListItem = {
            id: group.id,
            name: group.name || "",
            icon: group.icon,
            iconBg: group.iconBg,
            about: group.about,
            memberCount: group._count.participants,
            isJoined: group.participants.length > 0,
        };

        if (group.participants.length > 0) {
            joined.push(item);
        } else {
            discover.push(item);
        }
    });

    return { joined, discover };
}

export async function getGroupDetails(groupId: string) {
    const group = await conversationRepository.findById(groupId);
    if (!group || group.type !== ConversationType.group) {
        throw new NotFoundError("Group not found");
    }

    const members = await participantRepository.findByConversation(groupId);

    return {
        group: {
            id: group.id,
            name: group.name,
            icon: group.icon,
            iconBg: group.iconBg,
            about: group.about,
        },
        members: members.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            initials: m.user.initials,
            avatarColor: m.user.avatarColor,
            avatarUrl: m.user.avatarUrl,
            bio: m.user.bio,
            username: m.user.username,
            isOnline: m.user.isOnline,
            lastActive: m.user.lastActive,
        })),
        memberCount: members.length,
    };
}

export async function joinGroup(groupId: string, userId: string) {
    const group = await conversationRepository.findById(groupId);
    if (!group || group.type !== ConversationType.group) {
        throw new NotFoundError("Group not found");
    }

    const existing = await participantRepository.findByUserAndConversation(userId, groupId);
    if (existing) {
        throw new ConflictError("Already a member of this group");
    }

    await participantRepository.create({
        userId,
        conversationId: groupId,
    });

    return group;
}

export async function leaveGroup(groupId: string, userId: string) {
    const group = await conversationRepository.findById(groupId);
    if (!group || group.type !== ConversationType.group) {
        throw new NotFoundError("Group not found");
    }

    const participant = await participantRepository.findByUserAndConversation(userId, groupId);
    if (!participant) {
        throw new ForbiddenError("Not a member of this group");
    }

    await participantRepository.delete(userId, groupId);
}
