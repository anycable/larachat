import type Echo from 'laravel-echo';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PresenceIndicator } from '../../components/PresenceIndicator';
import { ToastContainer } from '../../components/Toast';
import { TypingIndicator } from '../../components/TypingIndicator';
import { NotificationProvider, useNotifications } from '../../contexts/NotificationContext';
import { TypingSet } from '../../lib/TypingSet';
import { ChatPageProps, Message } from '../../types/chat';

const autoScroll = (container: HTMLElement | null) => {
    if (!container) return;

    const isCurrentlyAtBottom = Math.abs(container.scrollTop - (container.scrollHeight - container.clientHeight)) < 50;

    if (isCurrentlyAtBottom) {
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }
};

interface MessageComponentProps {
    message: Message;
    mine: boolean;
    showName: boolean;
}

function MessageComponent({ message, mine, showName }: MessageComponentProps) {
    return (
        <div
            className={`relative flex max-w-[85%] flex-col gap-1 rounded-lg border p-2 pb-1 shadow md:max-w-[66%] ${
                mine
                    ? 'self-end border-teal-100 bg-teal-50 dark:border-none dark:bg-teal-600 dark:text-white'
                    : 'self-start bg-white dark:bg-gray-200 dark:text-black'
            }`}
        >
            {showName && <span className="truncate text-sm font-semibold text-purple-600 select-none">{message.username}</span>}
            <p className="text-lg font-medium">{message.body}</p>
        </div>
    );
}

interface MessageListProps {
    messages: Message[];
    user: string;
}

function MessageList({ messages, user }: MessageListProps) {
    return (
        <div className="flex flex-col justify-end gap-2 py-4">
            {messages.map((message, i) => {
                const mine = message.username === user;
                const showName = !mine && messages[i - 1]?.username !== message.username;

                return <MessageComponent key={message.id} message={message} mine={mine} showName={showName} />;
            })}
            {!messages.length && (
                <p className="mt-10 text-center text-base text-gray-500">No messages have been seen here recently. Don't be shy, send something!</p>
            )}
        </div>
    );
}

interface NewMessageFormProps {
    createMessage: (msg: string) => void;
    onTyping: () => void;
}

function NewMessageForm({ createMessage, onTyping }: NewMessageFormProps) {
    const [body, setBody] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (body.trim()) {
            createMessage(body);
            setBody('');
        }
    };

    return (
        <form className="flex gap-2" onSubmit={handleSubmit}>
            <div className="flex-grow rounded-md bg-white dark:bg-black">
                <label htmlFor="message" className="sr-only">
                    Message
                </label>
                <input
                    id="message"
                    className="h-full w-full rounded-md border-0 px-2.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 text-base sm:leading-6 dark:text-gray-100"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onInput={onTyping}
                    autoComplete="off"
                    placeholder="Message"
                />
            </div>

            <button
                className="relative cursor-pointer rounded-md bg-purple-800 px-5 py-2 font-medium text-white enabled:hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-75"
                type="submit"
                disabled={!body.trim()}
            >
                Send
            </button>
        </form>
    );
}

function ChatContent({ username, messages: initialMessages }: ChatPageProps) {
    const { notifications, removeNotification, addConnectionNotification, addPresenceEvent } = useNotifications();
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [typings, setTypings] = useState<string[]>([]);

    const channelRef = useRef<ReturnType<Echo<'pusher'>['join']> | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const typingSet = useMemo(() => new TypingSet((names: string[]) => setTypings(names)), []);

    // Auto-scroll to bottom on initial load
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [messages.length]);

    useEffect(() => {
        const channel = window.Echo.private('chat');
        channelRef.current = channel;

        channel.listen('.message.sent', (event: { id: number; username: string; body: string; created_at: string }) => {
            console.log('New message:', event);
            const newMessage: Message = {
                id: event.id,
                username: event.username,
                body: event.body,
                created_at: event.created_at,
            };

            // Clear typing info for this user
            typingSet.remove(newMessage.username);

            // Add message if not already present
            setMessages((prevMessages) => {
                if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
            setTimeout(() => autoScroll(messagesContainerRef.current), 10);
        });

        // Listen for typing events using whisper
        channel.listenForWhisper('typing', (event: { username: string }) => {
            if (event.username !== username) {
                typingSet.add(event.username);
            }
        });

        channel.subscribed(() => {
            setConnected(true);
            addConnectionNotification(true);
        });

        // There is no common disconnect-handling API in Echo?
        if (window.Echo.connector.pusher) {
            window.Echo.connector.pusher.connection.bind('state_change', function (states: { previous: string; current: string }) {
                if (states.previous === 'connected') {
                    console.log('WebSocket disconnected');
                    setConnected(false);
                    addConnectionNotification(false);
                }
            });
        } else if (window.Echo.connector.cable) {
            window.Echo.connector.cable.on('disconnect', () => {
                console.log('WebSocket disconnected');
                setConnected(false);
                addConnectionNotification(false);
            });
        }

        return () => {
            channel.stopListening('.message.sent');
            channel.stopListeningForWhisper('typing');
            typingSet.unwatch();
        };
    }, [username, typingSet, addConnectionNotification, addPresenceEvent]);

    const createMessage = async (body: string) => {
        // Send to server
        try {
            const response = await fetch(route('messages.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ body }),
            });

            if (!response.ok) {
                console.error('Failed to send message');
            } else {
                const message = await response.json();
                setMessages((prev) => [...prev, message]);
                setTimeout(() => autoScroll(messagesContainerRef.current), 10);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleTyping = () => {
        if (channelRef.current) {
            channelRef.current.whisper('typing', { username });
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(route('logout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                window.location.href = route('chat');
            } else {
                console.error('Failed to logout');
            }
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="min-h-screen w-full">
            <nav className="sticky top-0 z-50 border-b border-gray-500 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8 dark:bg-gray-900/95">
                <div className="mx-auto flex max-w-4xl items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                        <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
                            LaraChat
                        </h1>
                        <PresenceIndicator username={username} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-bold">{username}</span>
                        <span className={`inline-block h-4 w-4 rounded-full ${connected ? 'bg-green-700' : 'bg-red-600'}`}></span>
                        <button
                            onClick={handleLogout}
                            className="text-purple-600 underline transition-colors hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 72px)' }}>
                <div ref={messagesContainerRef} className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto pt-4">
                    <MessageList messages={messages} user={username} />
                </div>

                <div className="sticky bottom-0 mx-auto w-full max-w-4xl bg-white py-2 pb-4 dark:bg-gray-900">
                    <TypingIndicator names={typings} />
                    <div className="mt-2">
                        <NewMessageForm createMessage={createMessage} onTyping={handleTyping} />
                    </div>
                </div>
            </div>

            <ToastContainer notifications={notifications} onRemove={removeNotification} />
        </div>
    );
}

export default function Chat(props: ChatPageProps) {
    return (
        <NotificationProvider>
            <ChatContent {...props} />
        </NotificationProvider>
    );
}
