import {
  formatMessageTime,
  getInitials,
  getOtherParticipant,
  getUserAvatar,
  getUserName,
} from '@/lib/chat-utils';
import { Conversation } from '@/lib/types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  const otherParticipant = getOtherParticipant(conversation, currentUserId);
  const otherName = otherParticipant
    ? getUserName(otherParticipant)
    : 'Unknown';
  const avatar = otherParticipant
    ? getUserAvatar(otherParticipant)
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-zinc-800 px-4 py-4 text-left transition-colors hover:bg-zinc-900/60 ${
        isActive ? 'bg-zinc-900/80' : ''
      }`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={otherName}
          className="h-11 w-11 shrink-0 rounded-full border border-zinc-700 object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-white">
          {getInitials(otherName)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-white">{otherName}</p>
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            {formatMessageTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-zinc-500">
          {conversation.lastMessage ?? 'No messages yet'}
        </p>
      </div>
    </button>
  );
}