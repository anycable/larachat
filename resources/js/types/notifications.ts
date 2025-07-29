export interface Notification {
    id: string;
    type: 'connection' | 'presence';
    message: string;
    timestamp: number;
    duration?: number;
}

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface ToastNotification extends Notification {
    level: NotificationLevel;
    autoClose: boolean;
}

export interface PresenceEvent {
    type: 'joined' | 'left';
    username: string;
    timestamp: number;
}

export interface AggregatedPresenceEvent {
    joined: string[];
    left: string[];
    timestamp: number;
}
