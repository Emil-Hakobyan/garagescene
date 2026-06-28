'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { apiGet } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';
import { getSocket } from '@/lib/socket';
import { Conversation } from '@/lib/types/chat';
import { UserProfile } from '@/lib/types/user';

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      getSocket();

      const [user, conversations] = await Promise.all([
        apiGet<UserProfile>('/users/me', true),
        apiGet<Conversation[]>('/chat/conversations', true),
      ]);

      setCurrentUser(user);

      const match = conversations.find(
        (item) => item._id === params.conversationId,
      );
      setConversation(match ?? null);
      setIsReady(true);
    };

    load().catch(() => {
      setIsReady(true);
    });
  }, [params.conversationId, router]);

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
    <div className="flex h-screen flex-col bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3 md:hidden">
        <Link
          href="/chat"
          className="text-xs uppercase tracking-[0.2em] text-zinc-500"
        >
          ← Back to inbox
        </Link>
      </div>

      <div className="flex-1">
        <ChatWindow
          conversationId={params.conversationId}
          currentUser={currentUser}
          conversation={conversation ?? undefined}
        />
      </div>
    </div>
  );
}
