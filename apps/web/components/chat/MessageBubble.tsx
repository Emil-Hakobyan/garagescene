import { formatMessageTime } from '@/lib/chat-utils';
import { ChatMessage } from '@/lib/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 ${
          isMe
            ? 'bg-white text-black'
            : 'border border-zinc-800 bg-zinc-900 text-zinc-100'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <p
          className={`mt-2 text-[10px] uppercase tracking-[0.15em] ${
            isMe ? 'text-zinc-600' : 'text-zinc-500'
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
