# Convo Backend Architecture

## Overview

This document outlines the backend architecture for **Convo**, an open-source WhatsApp-like chat application. The backend is built with Node.js, Express.js, TypeScript, and PostgreSQL, supporting real-time messaging, authentication, and user management.

---

## Technology Stack

### Core Framework
| Package | Purpose |
|---------|---------|
| `express` | Web framework for REST APIs |
| `typescript` | Type safety and maintainability |
| `tsx` | Development server with hot reload |

### Real-Time Communication
| Package | Purpose |
|---------|---------|
| `socket.io` | Bi-directional real-time messaging, typing indicators, online status |

### Database
| Package | Purpose |
|---------|---------|
| `pg` | PostgreSQL client |
| `prisma` | ORM with type-safe queries, migrations, schema management |

### Authentication
| Package | Purpose |
|---------|---------|
| `google-auth-library` | Verify Google ID tokens for OAuth |
| `jsonwebtoken` | JWT generation and verification |

### File Uploads
| Package | Purpose |
|---------|---------|
| `multer` | Multipart/form-data handling |
| `cloudinary` | Cloud image storage with built-in transformations |

### Validation & Security
| Package | Purpose |
|---------|---------|
| `zod` | Schema validation for requests and environment variables |
| `helmet` | Security headers |
| `cors` | Cross-Origin Resource Sharing |
| `express-rate-limit` | Rate limiting |

### Utilities
| Package | Purpose |
|---------|---------|
| `dotenv` | Environment variable management |
| `uuid` | Generate unique IDs |
| `date-fns` | Date formatting |

---

## Database Schema

### Entity Relationship Diagram

```
erDiagram
    User ||--o{ Participant : "participates in"
    User ||--o{ Message : "sends"
    Conversation ||--o{ Participant : "has"
    Conversation ||--o{ Message : "contains"

    User {
        uuid id PK
        string email UK
        string name
        string initials
        string avatarColor
        string avatarUrl
        string bio
        string phoneNumber
        string username UK
        boolean isOnline
        datetime lastActive
        datetime createdAt
        datetime updatedAt
    }

    Conversation {
        uuid id PK
        enum type "direct|group"
        string name
        string icon
        string iconBg
        string about
        datetime createdAt
        datetime updatedAt
    }

    Participant {
        uuid id PK
        uuid userId FK
        uuid conversationId FK
        int unreadCount
        boolean isMuted
        boolean isBlocked
        datetime joinedAt
        datetime lastReadAt
    }

    Message {
        uuid id PK
        uuid conversationId FK
        uuid senderId FK
        string text
        string imageUrl
        enum status "sent|read"
        datetime createdAt
        datetime deletedAt
        enum deletedFor "self|everyone"
    }
```

---

### Table Definitions

#### `users` - User Profiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Google email |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `initials` | VARCHAR(2) | NOT NULL | Auto-generated from name |
| `avatarColor` | VARCHAR(20) | NOT NULL | HSL color for avatar bg |
| `avatarUrl` | TEXT | NULL | Profile image URL |
| `bio` | TEXT | NULL | About me |
| `phoneNumber` | VARCHAR(20) | NULL | Optional |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | @username |
| `isOnline` | BOOLEAN | DEFAULT false | Online status |
| `lastActive` | TIMESTAMP | NULL | Last activity |
| `createdAt` | TIMESTAMP | DEFAULT now() | Account creation |
| `updatedAt` | TIMESTAMP | DEFAULT now() | Last update |

#### `conversations` - Chat Threads
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `type` | ENUM | NOT NULL | 'direct' or 'group' |
| `name` | VARCHAR(100) | NULL | Group name (null for direct) |
| `icon` | VARCHAR(10) | NULL | Group emoji |
| `iconBg` | VARCHAR(20) | NULL | Icon background color |
| `about` | TEXT | NULL | Group description |
| `createdAt` | TIMESTAMP | DEFAULT now() | Creation time |
| `updatedAt` | TIMESTAMP | DEFAULT now() | Last activity |

#### `participants` - User-Conversation Junction
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `userId` | UUID | FK → users | User reference |
| `conversationId` | UUID | FK → conversations | Conversation reference |
| `unreadCount` | INT | DEFAULT 0 | Unread message count |
| `isMuted` | BOOLEAN | DEFAULT false | Notifications muted |
| `isBlocked` | BOOLEAN | DEFAULT false | User blocked (direct only) |
| `joinedAt` | TIMESTAMP | DEFAULT now() | Join time |
| `lastReadAt` | TIMESTAMP | NULL | Last read timestamp |

#### `messages` - Chat Messages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `conversationId` | UUID | FK → conversations | Conversation reference |
| `senderId` | UUID | FK → users | Sender reference |
| `text` | TEXT | NULL | Message content |
| `imageUrl` | TEXT | NULL | Attached image URL |
| `status` | ENUM | DEFAULT 'sent' | sent/read (for direct chats only) |
| `createdAt` | TIMESTAMP | DEFAULT now() | Send time |
| `deletedAt` | TIMESTAMP | NULL | Soft delete timestamp |
| `deletedFor` | ENUM | NULL | 'self' or 'everyone' |

---

### Database Indexes

```sql
-- Fast message loading (critical for chat performance)
CREATE INDEX idx_messages_conversation_created 
ON messages(conversationId, createdAt DESC);

-- Participant lookups
CREATE INDEX idx_participants_user ON participants(userId);
CREATE INDEX idx_participants_conversation ON participants(conversationId);
CREATE UNIQUE INDEX idx_participants_unique ON participants(userId, conversationId);

-- User lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online ON users(isOnline) WHERE isOnline = true;

-- Soft delete filtering
CREATE INDEX idx_messages_not_deleted ON messages(conversationId, createdAt DESC) 
WHERE deletedAt IS NULL;
```

---

### Default Groups (Seeded)

```typescript
const defaultGroups = [
  { 
    name: 'General Chat', 
    icon: '💬', 
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    about: 'General discussions and announcements'
  },
  { 
    name: 'Tech Talk', 
    icon: '💻', 
    iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    about: 'Technology, programming, and gadgets'
  },
  { 
    name: 'Movie Lounge', 
    icon: '🎬', 
    iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
    about: 'Movies, reviews, and recommendations'
  },
  { 
    name: 'TV & Series Hub', 
    icon: '📺', 
    iconBg: 'bg-gradient-to-br from-green-400 to-green-600',
    about: 'TV shows and series discussions'
  },
  { 
    name: 'Pop Culture & Gaming', 
    icon: '🎮', 
    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    about: 'Gaming, anime, comics, and pop culture'
  }
];
```

---

## API Endpoints

All endpoints use `/api/v1/` prefix for versioning.

### Health & Status

#### `GET /api/v1/health`
| Aspect | Details |
|--------|---------|
| **Purpose** | Basic health check |
| **Response** | `{ status: 'ok', timestamp: string, version: string }` |

#### `GET /api/v1/health/ready`
| Aspect | Details |
|--------|---------|
| **Purpose** | Readiness check (includes DB connectivity) |
| **Response** | `{ status: 'ok', database: 'connected' }` |

---

### Authentication

#### `POST /api/v1/auth/google`
| Aspect | Details |
|--------|---------|
| **Purpose** | Handle Google OAuth and create/login user |
| **Request Body** | `{ idToken: string }` |
| **Response** | `{ user: User, token: string }` |
| **Business Logic** | 1. Verify ID token with `google-auth-library`<br>2. Extract email, name, picture<br>3. Find or create user (generate username with collision handling)<br>4. Generate JWT<br>5. Return user + token |

#### `POST /api/v1/auth/logout`
| Aspect | Details |
|--------|---------|
| **Headers** | `Authorization: Bearer <token>` |
| **Response** | `{ success: true }` |
| **Business Logic** | Set user `isOnline = false`, update `lastActive` |

#### `GET /api/v1/auth/me`
| Aspect | Details |
|--------|---------|
| **Headers** | `Authorization: Bearer <token>` |
| **Response** | `{ user: User }` |
| **Business Logic** | Verify JWT, return user from DB |

---

### Users

#### `GET /api/v1/users`
| Aspect | Details |
|--------|---------|
| **Query Params** | `?search=<term>` (optional) |
| **Response** | `{ users: User[] }` |
| **Business Logic** | Fetch all users except current, filter by name if search provided |

#### `GET /api/v1/users/:id`
| Aspect | Details |
|--------|---------|
| **Response** | `{ user: User }` |

#### `PATCH /api/v1/users/me`
| Aspect | Details |
|--------|---------|
| **Request Body** | `{ name?, username?, bio?, phoneNumber? }` |
| **Response** | `{ user: User }` |
| **Business Logic** | Validate unique username, update fields, regenerate initials if name changed |

#### `POST /api/v1/users/me/avatar`
| Aspect | Details |
|--------|---------|
| **Content-Type** | `multipart/form-data` |
| **Request Body** | Form data with `avatar` file |
| **Response** | `{ avatarUrl: string }` |
| **Business Logic** | Validate image type/size, upload to Cloudinary, update user.avatarUrl |

---

### Conversations

#### `GET /api/v1/conversations`
| Aspect | Details |
|--------|---------|
| **Response** | `{ conversations: ConversationWithLastMessage[] }` |
| **Business Logic** | Find all conversations where user is participant, include last message, other user info for direct chats, unread count. Order by last message DESC |

#### `POST /api/v1/conversations`
| Aspect | Details |
|--------|---------|
| **Request Body** | `{ userId: string }` |
| **Response** | `{ conversation: Conversation, created: boolean }` |
| **Business Logic** | Find existing direct conversation or create new one with participants |

#### `GET /api/v1/conversations/:id`
| Aspect | Details |
|--------|---------|
| **Query Params** | `?limit=50&cursor=<messageId>` (cursor-based pagination) |
| **Response** | `{ conversation: Conversation, messages: Message[], nextCursor: string?, hasMore: boolean }` |
| **Business Logic** | Verify user is participant, fetch messages (excluding soft-deleted), mark as read, reset unread count |

---

### Messages

#### `POST /api/v1/conversations/:id/messages`
| Aspect | Details |
|--------|---------|
| **Request Body** | `{ text?: string, imageUrl?: string }` |
| **Response** | `{ message: Message }` |
| **Business Logic** | 1. Validate user is participant<br>2. Create message with status 'sent'<br>3. Update conversation.updatedAt<br>4. Increment unread for other participants<br>5. Emit via Socket.io |

#### `POST /api/v1/messages/:id/read`
| Aspect | Details |
|--------|---------|
| **Response** | `{ success: true }` |
| **Business Logic** | Update message.status to 'read', update participant.lastReadAt, emit read receipt via Socket.io |

#### `DELETE /api/v1/messages/:id`
| Aspect | Details |
|--------|---------|
| **Query Params** | `?for=self` or `?for=everyone` |
| **Response** | `{ success: true }` |
| **Business Logic** | Soft delete: set deletedAt and deletedFor. If 'everyone', emit via Socket.io |

#### `POST /api/v1/upload/image`
| Aspect | Details |
|--------|---------|
| **Content-Type** | `multipart/form-data` |
| **Response** | `{ imageUrl: string }` |
| **Business Logic** | Validate file type/size, upload to Cloudinary, return URL |

---

### Groups

#### `GET /api/v1/groups`
| Aspect | Details |
|--------|---------|
| **Query Params** | `?search=<term>` (optional) |
| **Response** | `{ joined: Group[], discover: Group[] }` |
| **Business Logic** | Separate groups user has joined vs available to join |

#### `POST /api/v1/groups/:id/join`
| Aspect | Details |
|--------|---------|
| **Response** | `{ success: true, conversation: Conversation }` |
| **Business Logic** | Create participant record, emit member-joined event |

#### `POST /api/v1/groups/:id/leave`
| Aspect | Details |
|--------|---------|
| **Response** | `{ success: true }` |
| **Business Logic** | Delete participant record, emit member-left event |

#### `GET /api/v1/groups/:id`
| Aspect | Details |
|--------|---------|
| **Response** | `{ group: Group, members: User[], memberCount: number }` |

---

## Socket.io Events

### Room Strategy

```typescript
// User joins their personal room on connect
socket.join(`user:${userId}`);

// User joins conversation rooms for real-time updates
socket.join(`conversation:${conversationId}`);
```

### Client → Server Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `join` | `{ userId }` | User connects, join personal room |
| `conversation:join` | `{ conversationId }` | Join conversation room |
| `conversation:leave` | `{ conversationId }` | Leave conversation room |
| `typing:start` | `{ conversationId }` | User started typing |
| `typing:stop` | `{ conversationId }` | User stopped typing |

### Server → Client Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId, lastActive }` | User went offline |
| `message:new` | `{ message, conversationId }` | New message |
| `message:status` | `{ messageId, status, userId? }` | Status update |
| `message:deleted` | `{ messageId, conversationId }` | Message deleted for everyone |
| `typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `group:member-joined` | `{ conversationId, user }` | Member joined group |
| `group:member-left` | `{ conversationId, userId }` | Member left group |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client export
│   │   ├── env.ts               # Zod-validated environment
│   │   └── socket.ts            # Socket.io setup
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── conversation.controller.ts
│   │   ├── message.controller.ts
│   │   └── group.controller.ts
│   ├── repositories/            # Data access layer
│   │   ├── user.repository.ts
│   │   ├── conversation.repository.ts
│   │   ├── participant.repository.ts
│   │   └── message.repository.ts
│   ├── services/                # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── conversation.service.ts
│   │   ├── message.service.ts
│   │   ├── group.service.ts
│   │   └── cloudinary.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── conversation.routes.ts
│   │   ├── message.routes.ts
│   │   └── group.routes.ts
│   ├── socket/
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── conversation.schema.ts
│   │   └── message.schema.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── avatar.ts
│   │   ├── errors.ts
│   │   └── requestId.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### Architecture Flow

```
Controllers → Services → Repositories → Prisma → Database
     ↓            ↓            ↓
  HTTP/WS    Business     Data Access
  Handling    Logic        (CRUD)
```

---

## Repository Pattern

Repositories handle all database operations. Services contain business logic and call repositories.

```typescript
// src/repositories/user.repository.ts
import { prisma } from '../config/database';
import { User, Prisma } from '@prisma/client';

export const userRepository = {
  findById: (id: string) => 
    prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string) => 
    prisma.user.findUnique({ where: { email } }),

  findByUsername: (username: string) => 
    prisma.user.findUnique({ where: { username } }),

  findAll: (excludeUserId?: string) => 
    prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : undefined,
      orderBy: { name: 'asc' }
    }),

  create: (data: Prisma.UserCreateInput) => 
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) => 
    prisma.user.update({ where: { id }, data }),

  updateOnlineStatus: (id: string, isOnline: boolean) => 
    prisma.user.update({
      where: { id },
      data: { isOnline, lastActive: isOnline ? undefined : new Date() }
    }),
};
```

```typescript
// src/services/user.service.ts - Uses repository
import { userRepository } from '../repositories/user.repository';
import { generateInitials, generateAvatarColor } from '../utils/avatar';

export async function createUserFromGoogle(email: string, name: string, picture?: string) {
  const existing = await userRepository.findByEmail(email);
  if (existing) return existing;

  const username = await generateUniqueUsername(name);
  
  return userRepository.create({
    email,
    name,
    username,
    initials: generateInitials(name),
    avatarColor: generateAvatarColor(),
    avatarUrl: picture,
  });
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.username) {
    const existing = await userRepository.findByUsername(data.username);
    if (existing && existing.id !== userId) {
      throw new Error('Username already taken');
    }
  }
  return userRepository.update(userId, data);
}
```

---

## Cloudinary Service

```typescript
// src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: Express.Multer.File,
  folder: string = 'convo'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(file.buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

---

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/convo

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Request/Response Flow Example

### Sending a Message (Direct Chat)

```
sequenceDiagram
    participant F as Frontend
    participant API as Express API
    participant DB as PostgreSQL
    participant S as Socket.io
    participant R as Recipient

    F->>API: POST /api/v1/conversations/:id/messages
    API->>API: Verify JWT
    API->>DB: Create message (status: sent)
    API->>DB: Update conversation.updatedAt
    API->>DB: Increment recipient unreadCount
    API-->>F: { message }
    API->>S: Emit to conversation room
    S->>R: 'message:new' event
    R->>API: POST /api/v1/messages/:id/read
    API->>DB: Update message.status = 'read'
    API->>S: Emit 'message:status'
    S->>F: Status update (blue ticks)
```
