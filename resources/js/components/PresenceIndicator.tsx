import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { PresenceUser } from '../types/chat';

interface PresenceIndicatorProps {
    username: string;
}

export function PresenceIndicator({ username }: PresenceIndicatorProps) {
    const [names, setNames] = useState<string[]>([]);
    const { addPresenceEvent } = useNotifications();

    useEffect(() => {
        const presenceChannel = window.Echo.join('chat-presence');

        presenceChannel
            .here((users: PresenceUser[]) => {
                const userNames = users.map((user) => user.name).filter((name) => name !== username);
                setNames(userNames);
            })
            .joining((user: PresenceUser) => {
                if (user.name !== username) {
                    setNames((prev) => [...prev, user.name]);
                    addPresenceEvent({
                        type: 'joined',
                        username: user.name,
                        timestamp: Date.now(),
                    });
                }
            })
            .leaving((user: PresenceUser) => {
                if (user.name !== username) {
                    setNames((prev) => prev.filter((name) => name !== user.name));
                    addPresenceEvent({
                        type: 'left',
                        username: user.name,
                        timestamp: Date.now(),
                    });
                }
            });

        return () => {
            window.Echo.leave('chat-presence');
        };
    }, [username, addPresenceEvent]);

    return (
        <div className="group relative">
            <div className={`flex cursor-pointer items-center space-x-1 dark:shadow-sm ${names.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                <span className="text-sm font-bold">{names.length}</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
            </div>
            {names.length > 0 && (
                <div className="absolute top-0 left-full mb-2 hidden rounded-lg bg-gray-800 px-2 py-1 text-sm whitespace-nowrap text-white shadow-lg group-hover:block">
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
            )}
        </div>
    );
}
