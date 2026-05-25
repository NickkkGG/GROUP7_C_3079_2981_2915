'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ type, message, onClose, duration = 4000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    warning: <AlertCircle size={20} className="text-orange-600" />
  };

  const styles = {
    success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-orange-50 border-orange-500 text-orange-900'
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className={`${styles[type]} border-[2px] rounded-[16px] px-4 py-3 shadow-lg flex items-center gap-3 min-w-[320px] max-w-[480px]`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-sm font-medium">
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
