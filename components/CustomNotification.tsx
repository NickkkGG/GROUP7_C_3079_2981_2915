'use client';

import { useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface CustomNotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose?: () => void;
}

export default function CustomNotification({
  message,
  type,
  duration = 4000,
  onClose
}: CustomNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const config = {
    success: {
      border: 'border-l-4 border-l-green-500',
      icon: <Check size={20} className="text-green-500" />,
      text: 'text-gray-800'
    },
    error: {
      border: 'border-l-4 border-l-red-500',
      icon: <AlertCircle size={20} className="text-red-500" />,
      text: 'text-gray-800'
    },
    info: {
      border: 'border-l-4 border-l-blue-500',
      icon: <Info size={20} className="text-blue-500" />,
      text: 'text-gray-800'
    }
  };

  const colors = config[type];

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-100 ${colors.border}`}
      >
        {colors.icon}
        <p className={`${colors.text} font-medium text-sm pr-4`}>{message}</p>
        <button 
          onClick={handleClose}
          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  const show = (message: string, type: NotificationType = 'info', duration = 4000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  return { notification, show };
}
