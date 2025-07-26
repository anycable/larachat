import { useEffect, useState } from 'react';
import { PresenceUser } from '../types/chat';

interface PresenceIndicatorProps {
  username: string;
}

export function PresenceIndicator({ username }: PresenceIndicatorProps) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const presenceChannel = window.Echo.join('chat-presence');
    presenceChannel.here((users: PresenceUser[]) => {
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
      window.Echo.leave('chat-presence');
    };
  }, [username]);

  if (names.length === 0) return null;

  return (
    <div className="group relative">
      <div className="flex items-center space-x-1 text-green-700 shadow-sm cursor-pointer">
        <span className="text-sm font-bold">{names.length}</span>
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      </div>
      <div className="absolute top-0 left-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
        <div>
            <ul className="space-y-1">
                {names.map((name, index) => (
                <li key={index} className="text-sm">
                    {name}
                </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
