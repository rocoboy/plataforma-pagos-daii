// Toast notification utility for showing user messages

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Show a toast notification to the user
 */
export const showNotification = (message: string, options: NotificationOptions = { type: 'info' }): void => {
  const { type, duration = 5000, position = 'top-right' } = options;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Apply styles
  Object.assign(toast.style, {
    position: 'fixed',
    padding: '12px 24px',
    margin: '10px',
    borderRadius: '6px',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    zIndex: '10000',
    maxWidth: '400px',
    wordWrap: 'break-word',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out',
    ...getPositionStyles(position),
    ...getTypeStyles(type)
  });

  // Add CSS animation keyframes if not already present
  addAnimationStyles();

  // Add to document
  document.body.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, duration);

  // Allow manual close on click
  toast.addEventListener('click', () => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  });
};

/**
 * Get position styles based on position option
 */
const getPositionStyles = (position: string): Record<string, string> => {
  switch (position) {
    case 'top-right':
      return { top: '20px', right: '20px' };
    case 'top-left':
      return { top: '20px', left: '20px' };
    case 'bottom-right':
      return { bottom: '20px', right: '20px' };
    case 'bottom-left':
      return { bottom: '20px', left: '20px' };
    default:
      return { top: '20px', right: '20px' };
  }
};

/**
 * Get color styles based on notification type
 */
const getTypeStyles = (type: string): Record<string, string> => {
  switch (type) {
    case 'success':
      return { backgroundColor: '#28a745', border: '1px solid #1e7e34' };
    case 'error':
      return { backgroundColor: '#dc3545', border: '1px solid #c82333' };
    case 'warning':
      return { backgroundColor: '#ffc107', color: '#212529', border: '1px solid #e0a800' };
    case 'info':
      return { backgroundColor: '#17a2b8', border: '1px solid #138496' };
    default:
      return { backgroundColor: '#6c757d', border: '1px solid #545b62' };
  }
};

/**
 * Add CSS animation styles to document if not already present
 */
const addAnimationStyles = (): void => {
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Convenience functions for common notification types
 */
export const showSuccess = (message: string, duration?: number): void => {
  showNotification(message, { type: 'success', duration });
};

export const showError = (message: string, duration?: number): void => {
  showNotification(message, { type: 'error', duration });
};

export const showWarning = (message: string, duration?: number): void => {
  showNotification(message, { type: 'warning', duration });
};

export const showInfo = (message: string, duration?: number): void => {
  showNotification(message, { type: 'info', duration });
};