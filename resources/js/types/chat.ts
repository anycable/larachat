export interface Message {
    id: number;
    username: string;
    body: string;
    created_at: string;
}

export interface ChatPageProps {
    username: string;
    messages: Message[];
}

export interface TypingUser {
    username: string;
    timestamp: number;
}

export interface PresenceUser {
    name: string;
}

export interface PresenceState {
    [key: string]: PresenceUser;
}
