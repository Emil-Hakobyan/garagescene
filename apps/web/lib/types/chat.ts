export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface ChatProject {
  _id: string;
  title: string;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[] | string[];
  project?: ChatProject | string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: ChatUser | string;
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}
