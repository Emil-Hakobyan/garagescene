'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api-client';
import { Conversation } from '@/lib/types/chat';
import { UserProfile } from '@/lib/types/user';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function NewMessageModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewMessageModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadUsers = async () => {
      setIsLoading(true);

      try {
        const data = await apiGet<UserProfile[]>('/users');
        setUsers(data);
      } catch {
        setError('Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleStartConversation = async (recipientId: string) => {
    setIsCreating(true);
    setError(null);

    try {
      const conversation = await apiPost<Conversation>(
        '/chat/conversations',
        { recipientId },
        true,
      );
      onConversationCreated(conversation);
      onClose();
      setQuery('');
    } catch {
      setError('Failed to start conversation.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Message</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 transition-colors hover:text-white"
          >
            Close
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search creatives by name..."
          className="mb-4 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-400"
        />

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <div className="max-h-80 overflow-y-auto border border-zinc-800">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              Loading users...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No users found.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                type="button"
                disabled={isCreating}
                onClick={() => handleStartConversation(user._id)}
                className="flex w-full items-center justify-between border-b border-zinc-800 px-4 py-3 text-left transition-colors hover:bg-zinc-900 disabled:opacity-50"
              >
                <span className="text-white">{user.name}</span>
                <span className="text-xs text-zinc-500">{user._id}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
