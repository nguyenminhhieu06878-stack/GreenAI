# Support Chat Feature Documentation

## Overview
Real-time support chat feature for Business plan (299k) landlords to communicate directly with admin.

## Features
- Real-time messaging using Socket.io
- Only available for landlords with Business plan (299k)
- Admin panel to view and reply to all support messages
- Message history persistence in MongoDB
- Unread message indicators for admin
- Automatic subscription access checking

## Architecture

### Backend Components

#### Models
- `SupportMessage.model.ts`: MongoDB schema for support messages
  - Fields: userId, message, isAdminReply, adminId, status, timestamps

#### Controllers
- `support.controller.ts`: Handles support chat operations
  - `checkSupportAccess`: Verify user has Business plan
  - `getMessages`: Get user's message history
  - `sendMessage`: User sends message to admin
  - `getAllSupportChats`: Admin gets list of all chats
  - `getChatMessages`: Admin gets messages for specific user
  - `replyToUser`: Admin replies to user

#### Routes
- `/api/support/check-access` (GET): Check if user has access
- `/api/support/messages` (GET): Get user's messages
- `/api/support/messages` (POST): Send message
- `/api/support/admin/chats` (GET): Get all chats (admin)
- `/api/support/admin/chats/:userId` (GET): Get chat messages (admin)
- `/api/support/admin/chats/:userId/reply` (POST): Reply to user (admin)

#### Socket.io Events
- `join`: User joins their personal room
- `join-admin`: Admin joins to listen to all messages
- `user-message`: User sends message (broadcast to admin)
- `admin-reply`: Admin sends reply (send to specific user)

### Frontend Components

#### User Pages
- `Support.tsx`: User support chat interface
  - Check subscription access
  - Real-time messaging
  - Message history
  - Upgrade prompt for non-Business users

#### Admin Pages
- `admin/Support.tsx`: Admin support panel
  - List of all user chats
  - Unread message indicators
  - Real-time message updates
  - Reply interface

#### Navigation
- Navbar: "Hỗ Trợ" menu item (only for landlords)
- Admin Sidebar: "Hỗ Trợ" menu item

## Subscription Integration

### PLAN_LIMITS
```typescript
'Gói Business': {
  support: true,  // Only Business plan has support chat
  // ... other features
}
```

### Access Control
- `SubscriptionService.canUseSupport()`: Checks if user is landlord with Business plan
- Middleware: `authenticateToken` for users, `authenticateAdmin` for admin
- Frontend: Shows upgrade screen if user doesn't have access

## Usage

### For Users (Landlords with Business Plan)
1. Navigate to "Hỗ Trợ" in navbar
2. Send messages to admin
3. Receive real-time replies
4. View message history

### For Admin
1. Navigate to "Hỗ Trợ" in admin sidebar
2. View list of all user chats
3. See unread message count
4. Click on chat to view messages
5. Reply to users in real-time

## Technical Details

### Socket.io Connection
- Server: `http://localhost:5000`
- CORS enabled for frontend origin
- Rooms: `user:{userId}` for individual users, `admin` for admin

### Message Flow
1. User sends message → Saved to DB → Emitted to admin room
2. Admin replies → Saved to DB → Emitted to user's room
3. Both parties receive real-time updates

### Database Schema
```typescript
{
  userId: ObjectId (ref: User),
  message: String,
  isAdminReply: Boolean,
  adminId: ObjectId (ref: User, optional),
  status: 'open' | 'replied' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

## Future Enhancements
- File/image attachments
- Typing indicators
- Read receipts
- Chat status management (open/closed)
- Email notifications for new messages
- Chat history export
- Multiple admin support
- Canned responses for common questions
