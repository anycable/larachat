import { useEffect, useState } from 'react';
import { ToastNotification } from '../types/notifications';

interface ToastProps {
    notification: ToastNotification;
    onRemove: (id: string) => void;
}

export function Toast({ notification, onRemove }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(() => onRemove(notification.id), 300);
    };

    const getToastStyles = () => {
        const baseStyles =
            'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out transform';

        if (isLeaving) {
            return `${baseStyles} translate-x-full opacity-0`;
        }

        if (isVisible) {
            return `${baseStyles} translate-x-0 opacity-100`;
        }

        return `${baseStyles} translate-x-full opacity-0`;
    };

    const getIconAndColors = () => {
        switch (notification.level) {
            case 'success':
                return {
                    icon: (
                        <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                };
            case 'error':
                return {
                    icon: (
                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                            />
                        </svg>
                    ),
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                };
            case 'warning':
                return {
                    icon: (
                        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    ),
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                };
            case 'info':
            default:
                return {
                    icon: (
                        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                        </svg>
                    ),
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                };
        }
    };

    const { icon, bgColor, borderColor } = getIconAndColors();

    return (
        <div className={getToastStyles()}>
            <div className={`border-l-4 p-4 ${bgColor} ${borderColor}`}>
                <div className="flex">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-base font-medium text-gray-900">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            onClick={handleRemove}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    notifications: ToastNotification[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ notifications, onRemove }: ToastContainerProps) {
    return (
        <div aria-live="assertive" className="pointer-events-none fixed inset-0 z-50 flex items-start px-4 py-6 sm:p-6">
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <Toast key={notification.id} notification={notification} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
}
