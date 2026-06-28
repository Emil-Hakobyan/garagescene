import {
  ChatProject,
  ChatUser,
  Conversation,
} from '@/lib/types/chat';

export function getUserId(user: ChatUser | string): string {
  return typeof user === 'string' ? user : user._id;
}

export function getUserName(user: ChatUser | string): string {
  return typeof user === 'string' ? 'User' : user.name;
}

export function getUserAvatar(user: ChatUser | string): string | undefined {
  return typeof user === 'string' ? undefined : user.avatar;
}

export function getProjectId(project?: ChatProject | string): string | undefined {
  if (!project) {
    return undefined;
  }

  return typeof project === 'string' ? project : project._id;
}

export function getProjectTitle(project?: ChatProject | string): string | undefined {
  if (!project) {
    return undefined;
  }

  return typeof project === 'string' ? 'Project' : project.title;
}

export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string,
): ChatUser | string | undefined {
  return conversation.participants.find(
    (participant) => getUserId(participant) !== currentUserId,
  );
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatMessageTime(dateString?: string): string {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
