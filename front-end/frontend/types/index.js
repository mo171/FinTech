// Type definitions for the application
// User type from Supabase
export const UserType = {
  id: 'string',
  email: 'string',
  user_metadata: {},
}

// Chat message type
export const MessageType = {
  id: 'string',
  text: 'string',
  sender: 'user' | 'ai',
  timestamp: 'Date',
}

// API Response types
export const ChatResponseType = {
  reply: 'string',
  conversationId: 'string',
  status: 'string',
}
