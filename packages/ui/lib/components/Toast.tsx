import { useEffect, useState } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const getToastStyles = (type: ToastType) => {
  const baseStyles = {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 10000000,
    animation: 'slideIn 0.3s ease',
  };

  switch (type) {
    case 'success':
      return { ...baseStyles, backgroundColor: '#10b981', color: 'white' };
    case 'warning':
      return { ...baseStyles, backgroundColor: '#f59e0b', color: 'white' };
    case 'error':
      return { ...baseStyles, backgroundColor: '#ef4444', color: 'white' };
    case 'info':
    default:
      return { ...baseStyles, backgroundColor: '#3b82f6', color: 'white' };
  }
};

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getToastStyles(type)}>{message}</div>
    </>
  );
};

export { Toast };
export type { ToastType };
