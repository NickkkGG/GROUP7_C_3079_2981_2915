'use client';

import { useEffect, useState } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      icon: <Check size={20} className="text-green-400" />,
      text: 'text-green-100'
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      icon: <AlertCircle size={20} className="text-red-400" />,
      text: 'text-red-100'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      icon: <Info size={20} className="text-blue-400" />,
      text: 'text-blue-100'
    }
  };

  const colors = config[type];

  return (
    <div className="fixed top-24 right-6 z-[9999] animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border ${colors.bg} ${colors.border} backdrop-blur-sm`}
      >
        {colors.icon}
        <p className={`${colors.text} font-medium text-sm`}>{message}</p>
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
