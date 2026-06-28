'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationItem } from '@/components/chat/ConversationItem';
import { NewMessageModal } from '@/components/chat/NewMessageModal';
import { apiGet, apiPost } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { getSocket } from '@/lib/socket';
import { Conversation } from '@/lib/types/chat';
import { UserProfile } from '@/lib/types/user';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Loading...
          </p>
        </div>
      }
    >
      <ChatInboxPage />
    </Suspense>
  );
}

function ChatInboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    const data = await apiGet<Conversation[]>('/chat/conversations', true);
    setConversations(data);
    return data;
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const initialize = async () => {
      try {
        getSocket();
        const user = await apiGet<UserProfile>('/users/me', true);
        setCurrentUser(user);

        const recipientId = searchParams.get('recipient');
        const projectId = searchParams.get('project');

        if (recipientId) {
          const conversation = await apiPost<Conversation>(
            '/chat/conversations',
            {
              recipientId,
              projectId: projectId ?? undefined,
            },
            true,
          );
          setSelectedId(conversation._id);
          router.replace(`/chat?conversation=${conversation._id}`);
        } else {
          const conversationParam = searchParams.get('conversation');
          if (conversationParam) {
            setSelectedId(conversationParam);
          }
        }

        await loadConversations();
        setIsReady(true);
      } catch {
        setError('Failed to load conversations.');
        setIsReady(true);
      }
    };

    initialize();
  }, [loadConversations, router, searchParams]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleNewMessage = (message: {
      conversation: string;
      content: string;
      createdAt: string;
    }) => {
      setConversations((current) => {
        const updated = current.map((conversation) =>
          conversation._id === message.conversation
            ? {
                ...conversation,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
              }
            : conversation,
        );

        return updated.sort((a, b) => {
          const aTime = new Date(a.lastMessageAt ?? a.updatedAt ?? 0).getTime();
          const bTime = new Date(b.lastMessageAt ?? b.updatedAt ?? 0).getTime();
          return bTime - aTime;
        });
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    if (window.innerWidth < 768) {
      router.push(`/chat/${conversationId}`);
      return;
    }

    setSelectedId(conversationId);
    router.push(`/chat?conversation=${conversationId}`);
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations((current) => [conversation, ...current]);
    setSelectedId(conversation._id);
    router.push(`/chat?conversation=${conversation._id}`);
  };

  const handleConversationUpdate = (updated: Conversation) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation._id === updated._id
          ? { ...conversation, ...updated }
          : conversation,
      ),
    );
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedId,
  );

  if (!isReady || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <aside className="flex w-full max-w-md flex-col border-r border-zinc-800">
        <div className="border-b border-zinc-800 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Link
                href="/dashboard"
                className="text-xs uppercase tracking-[0.35em] text-zinc-500"
              >
                GarageScene
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-white">Messages</h1>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black hover:bg-zinc-200"
            >
              New Message
            </button>
          </div>
        </div>

        {error && (
          <p className="border-b border-red-900/40 px-5 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-5 py-10 text-sm text-zinc-500">
              No conversations yet. Start a new message.
            </p>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                currentUserId={currentUser._id}
                isActive={conversation._id === selectedId}
                onClick={() => handleSelectConversation(conversation._id)}
              />
            ))
          )}
        </div>
      </aside>

      <main className="hidden flex-1 md:flex">
        {selectedId ? (
          <ChatWindow
            conversationId={selectedId}
            currentUser={currentUser}
            conversation={selectedConversation}
            onConversationUpdate={handleConversationUpdate}
            compact
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Select a conversation
            </p>
          </div>
        )}
      </main>

      <NewMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
