import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AggregatedPresenceEvent, NotificationLevel, PresenceEvent, ToastNotification } from '../types/notifications';

interface NotificationContextType {
    notifications: ToastNotification[];
    addNotification: (message: string, level: NotificationLevel, type: 'connection' | 'presence', duration?: number) => void;
    removeNotification: (id: string) => void;
    addConnectionNotification: (isOnline: boolean) => void;
    addPresenceEvent: (event: PresenceEvent) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<ToastNotification[]>([]);
    const presenceEventsRef = useRef<PresenceEvent[]>([]);
    const presenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const addNotification = useCallback((message: string, level: NotificationLevel, type: 'connection' | 'presence', duration: number = 5000) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const notification: ToastNotification = {
            id,
            type,
            message,
            level,
            timestamp: Date.now(),
            duration,
            autoClose: true,
        };

        setNotifications((prev) => {
            // there should be only one connection notification
            if (notification.type === 'connection') {
                return [...prev.filter((n) => n.type !== 'connection'), notification];
            }

            return [...prev, notification]
        });

        // Auto-remove notification after duration
        if (duration > 0) {
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addConnectionNotification = useCallback(
        (isOnline: boolean) => {
            if (isOnline) {
                const message = "You're online!";
                const level: NotificationLevel = 'success';
                const duration = 3000;
                const id = `notification-${Date.now()}-${Math.random()}`;
                const notification: ToastNotification = {
                    id,
                    type: 'connection',
                    message,
                    level,
                    timestamp: Date.now(),
                    duration,
                    autoClose: true,
                };

                // Remove offline notifications and add online notification in one update
                setNotifications((prev) => {
                    const filtered = prev.filter((n) => !(n.type === 'connection' && n.level === 'error'));
                    return [...filtered, notification];
                });

                // Auto-remove notification after duration
                if (duration > 0) {
                    setTimeout(() => {
                        setNotifications((prev) => prev.filter((n) => n.id !== id));
                    }, duration);
                }
            } else {
                const message = "Connection lost, you're offline";
                const level: NotificationLevel = 'error';
                const duration = 0; // Keep offline notification until reconnected
                addNotification(message, level, 'connection', duration);
            }
        },
        [addNotification],
    );

    const processPresenceEvents = useCallback(() => {
        if (presenceEventsRef.current.length === 0) return;

        const events = [...presenceEventsRef.current];
        presenceEventsRef.current = [];

        // Aggregate events
        const aggregated: AggregatedPresenceEvent = {
            joined: [],
            left: [],
            timestamp: Date.now(),
        };

        events.forEach((event) => {
            if (event.type === 'joined') {
                // Remove from left if they were there (they rejoined quickly)
                const leftIndex = aggregated.left.indexOf(event.username);
                if (leftIndex > -1) {
                    aggregated.left.splice(leftIndex, 1);
                } else {
                    aggregated.joined.push(event.username);
                }
            } else {
                // Remove from joined if they were there (they left quickly)
                const joinedIndex = aggregated.joined.indexOf(event.username);
                if (joinedIndex > -1) {
                    aggregated.joined.splice(joinedIndex, 1);
                } else {
                    aggregated.left.push(event.username);
                }
            }
        });

        // Create notifications for aggregated events
        if (aggregated.joined.length > 0) {
            const message =
                aggregated.joined.length === 1 ? `${aggregated.joined[0]} joined the room` : `${aggregated.joined.length} users joined the room`;
            addNotification(message, 'info', 'presence', 2000);
        }

        if (aggregated.left.length > 0) {
            const message = aggregated.left.length === 1 ? `${aggregated.left[0]} left the room` : `${aggregated.left.length} users left the room`;
            addNotification(message, 'info', 'presence', 2000);
        }
    }, [addNotification]);

    const addPresenceEvent = useCallback(
        (event: PresenceEvent) => {
            presenceEventsRef.current.push(event);

            // Clear existing timer
            if (presenceTimerRef.current) {
                clearTimeout(presenceTimerRef.current);
            }

            // Set new timer for 2 seconds
            presenceTimerRef.current = setTimeout(() => {
                processPresenceEvents();
                presenceTimerRef.current = null;
            }, 2000);
        },
        [processPresenceEvents],
    );

    const value: NotificationContextType = {
        notifications,
        addNotification,
        removeNotification,
        addConnectionNotification,
        addPresenceEvent,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
