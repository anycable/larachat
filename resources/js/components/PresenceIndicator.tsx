import { useEffect, useState } from 'react';
import { PresenceUser } from '../types/chat';

interface PresenceIndicatorProps {
  username: string;
}

const formatOnlineNames = (names: string[]): string => {
  if (names.length === 0) return '';

  if (names.length === 1) return names[0] + ' is online';

  if (names.length === 2) return names.join(' and ') + ' are online';

  if (names.length === 3)
    return `${names[0]}, ${names[1]}, and ${names[2]} are online`;

  return `${names[0]}, ${names[1]}, and ${names.length - 2} more are online`;
};

export function PresenceIndicator({ username }: PresenceIndicatorProps) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const presenceChannel = window.Echo.join('chat-presence')
      .here((users: PresenceUser[]) => {
        const userNames = users
          .map(user => user.name)
          .filter(name => name !== username);
        setNames(userNames);
      })
      .joining((user: PresenceUser) => {
        if (user.name !== username) {
          setNames(prev => [...prev, user.name]);
        }
      })
      .leaving((user: PresenceUser) => {
        setNames(prev => prev.filter(name => name !== user.name));
      });

    return () => {
      presenceChannel.leave();
    };
  }, [username]);

  if (names.length === 0) return null;

  return (
    <div className="absolute top-4 right-2 rounded-full bg-gray-200 px-3 py-1 text-gray-600 shadow-sm">
      {formatOnlineNames(names)}
    </div>
  );
}