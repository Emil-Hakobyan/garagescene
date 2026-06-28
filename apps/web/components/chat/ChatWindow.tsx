'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { apiGet, apiPost } from '@/lib/api-client';
import {
  getInitials,
  getOtherParticipant,
  getProjectId,
  getProjectTitle,
  getUserAvatar,
  getUserId,
  getUserName,
} from '@/lib/chat-utils';
import { getSocket } from '@/lib/socket';
import { ChatMessage, Conversation } from '@/lib/types/chat';
import { Project } from '@/lib/types/project';
import { UserProfile } from '@/lib/types/user';

interface ChatWindowProps {
  conversationId: string;
  currentUser: UserProfile;
  conversation?: Conversation;
  onConversationUpdate?: (conversation: Conversation) => void;
  compact?: boolean;
}

export function ChatWindow({
  conversationId,
  currentUser,
  conversation,
  onConversationUpdate,
  compact = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation
    ? getOtherParticipant(conversation, currentUser._id)
    : undefined;
  const otherUserId = otherParticipant ? getUserId(otherParticipant) : undefined;
  const otherName = otherParticipant ? getUserName(otherParticipant) : 'Chat';
  const otherAvatar = otherParticipant
    ? getUserAvatar(otherParticipant)
    : undefined;
  const projectId = getProjectId(conversation?.project);
  const projectTitle = getProjectTitle(conversation?.project);

  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    apiGet<Project>(`/projects/${projectId}`, true)
      .then((project) => {
        const ownerId =
          typeof project.owner === 'string'
            ? project.owner
            : project.owner._id;
        setProjectOwnerId(ownerId);
      })
      .catch(() => {
        setProjectOwnerId(null);
      });
  }, [projectId]);

  const canGrantAccess =
    projectId &&
    otherUserId &&
    projectOwnerId === currentUser._id &&
    otherUserId !== currentUser._id;

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiGet<ChatMessage[]>(
          `/chat/conversations/${conversationId}/messages`,
          true,
        );
        setMessages(data);
      } catch {
        setError('Failed to load messages.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    socket.emit('join_conversation', { conversationId });

    const handleNewMessage = (message: ChatMessage) => {
      const messageConversationId =
        typeof message.conversation === 'string'
          ? message.conversation
          : message.conversation;

      if (messageConversationId !== conversationId) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) {
          return current;
        }

        return [...current, message];
      });

      if (getUserId(message.sender) !== currentUser._id) {
        socket.emit('mark_read', { conversationId });
      }

      onConversationUpdate?.({
        ...(conversation ?? { _id: conversationId, participants: [] }),
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      } as Conversation);
    };

    socket.on('new_message', handleNewMessage);

    socket.emit('mark_read', { conversationId });

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [conversationId, currentUser._id, conversation, onConversationUpdate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const socket = getSocket();

      if (socket?.connected) {
        socket.emit('send_message', {
          conversationId,
          content: trimmed,
        });
        setContent('');
      } else {
        setError('Socket not connected.');
      }
    } catch {
      setError('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!projectId || !otherUserId) {
      return;
    }

    setGrantMessage(null);

    try {
      await apiPost(`/projects/${projectId}/access/${otherUserId}/grant`, {}, true);
      setGrantMessage('Full access granted.');
    } catch {
      setGrantMessage('Failed to grant access.');
    }
  };

  return (
    <div className={`flex h-full flex-col ${compact ? '' : 'min-h-screen'}`}>
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-5 py-4">
        {projectTitle && (
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Project: {projectTitle}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {otherAvatar ? (
              <img
                src={otherAvatar}
                alt={otherName}
                className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-white">
                {getInitials(otherName)}
              </div>
            )}

            <div>
              {otherUserId ? (
                <Link
                  href={`/users/${otherUserId}`}
                  className="font-semibold text-white transition-colors hover:text-zinc-300"
                >
                  {otherName}
                </Link>
              ) : (
                <p className="font-semibold text-white">{otherName}</p>
              )}
            </div>
          </div>

          {canGrantAccess && (
            <button
              type="button"
              onClick={handleGrantAccess}
              className="border border-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-black"
            >
              Grant Full Access
            </button>
          )}
        </div>

        {grantMessage && (
          <p className="mt-3 text-sm text-emerald-400">{grantMessage}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-zinc-950 px-5 py-6">
        {isLoading ? (
          <p className="text-center text-sm uppercase tracking-[0.2em] text-zinc-500">
            Loading messages...
          </p>
        ) : error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            No messages yet. Say something.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isMe={getUserId(message.sender) === currentUser._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-400"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !content.trim()}
            className="bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
