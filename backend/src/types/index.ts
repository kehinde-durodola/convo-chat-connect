import { User, Conversation, Participant, Message } from "@prisma/client";

export type UserWithoutSensitive = Omit<User, "email">;

export interface UserPublic {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    avatarUrl: string | null;
    bio: string | null;
    username: string;
    isOnline: boolean;
    lastActive: Date | null;
}

export interface ConversationWithDetails extends Conversation {
    participants: ParticipantWithUser[];
    lastMessage: Message | null;
}

export interface ParticipantWithUser extends Participant {
    user: UserPublic;
}

export interface MessageWithSender extends Message {
    sender: UserPublic;
}

export interface ConversationListItem {
    id: string;
    type: "direct" | "group";
    name: string | null;
    icon: string | null;
    iconBg: string | null;
    otherUser: UserPublic | null;
    lastMessage: {
        text: string | null;
        imageUrl: string | null;
        createdAt: Date;
        senderId: string;
    } | null;
    unreadCount: number;
    updatedAt: Date;
}

export interface GroupListItem {
    id: string;
    name: string;
    icon: string | null;
    iconBg: string | null;
    about: string | null;
    memberCount: number;
    isJoined: boolean;
}

export interface PaginatedMessages {
    messages: MessageWithSender[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface SocketUser {
    id: string;
    socketId: string;
}
