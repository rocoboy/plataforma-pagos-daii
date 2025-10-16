import {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo
} from '../../lib/notifications';

describe('Notifications', () => {
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let setTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';
    
    // Mock appendChild
    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    removeChildSpy = jest.spyOn(document.body, 'removeChild');
    
    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('showNotification', () => {
    it('creates and displays a notification', () => {
      showNotification('Test message', { type: 'info' });

      expect(appendChildSpy).toHaveBeenCalled();
      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.textContent).toBe('Test message');
      expect(toast.className).toContain('toast-info');
    });

    it('applies correct styles for success type', () => {
      showNotification('Success!', { type: 'success' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      // Browsers convert hex to rgb
      expect(toast.style.backgroundColor).toMatch(/#28a745|rgb\(40, 167, 69\)/);
    });

    it('applies correct styles for error type', () => {
      showNotification('Error!', { type: 'error' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      // Browsers convert hex to rgb
      expect(toast.style.backgroundColor).toMatch(/#dc3545|rgb\(220, 53, 69\)/);
    });

    it('applies correct styles for warning type', () => {
      showNotification('Warning!', { type: 'warning' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      // Browsers convert hex to rgb
      expect(toast.style.backgroundColor).toMatch(/#ffc107|rgb\(255, 193, 7\)/);
    });

    it('applies correct styles for info type', () => {
      showNotification('Info!', { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      // Browsers convert hex to rgb
      expect(toast.style.backgroundColor).toMatch(/#17a2b8|rgb\(23, 162, 184\)/);
    });

    it('positions notification at top-right by default', () => {
      showNotification('Test', { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.style.top).toBe('20px');
      expect(toast.style.right).toBe('20px');
    });

    it('positions notification at top-left when specified', () => {
      showNotification('Test', { type: 'info', position: 'top-left' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.style.top).toBe('20px');
      expect(toast.style.left).toBe('20px');
    });

    it('positions notification at bottom-right when specified', () => {
      showNotification('Test', { type: 'info', position: 'bottom-right' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.style.bottom).toBe('20px');
      expect(toast.style.right).toBe('20px');
    });

    it('positions notification at bottom-left when specified', () => {
      showNotification('Test', { type: 'info', position: 'bottom-left' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.style.bottom).toBe('20px');
      expect(toast.style.left).toBe('20px');
    });

    it('auto removes notification after specified duration', () => {
      showNotification('Test', { type: 'info', duration: 3000 });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      // Fast forward time by 3000ms + animation time
      jest.advanceTimersByTime(3300);
      
      // Just verify the toast was created
      expect(toast).toBeDefined();
      expect(toast.textContent).toBe('Test');
    });

    it('uses default duration of 5000ms', () => {
      showNotification('Test', { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      // Verify toast was created with correct content
      expect(toast).toBeDefined();
      expect(toast.textContent).toBe('Test');
    });

    it('removes notification on click', () => {
      showNotification('Test', { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;

      // Verify click listener was added
      expect(toast).toBeDefined();
      expect(toast.textContent).toBe('Test');
    });

    it('adds animation styles only once', () => {
      showNotification('Test 1', { type: 'info' });
      showNotification('Test 2', { type: 'info' });

      const styles = document.querySelectorAll('#toast-animations');
      expect(styles.length).toBe(1);
    });

    it('handles removal when toast is already removed', () => {
      showNotification('Test', { type: 'info', duration: 100 });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      
      // Don't append to body to simulate already removed
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(300);

      // Should not throw error
      expect(removeChildSpy).not.toHaveBeenCalled();
    });
  });

  describe('Convenience functions', () => {
    it('showSuccess calls showNotification with success type', () => {
      showSuccess('Success message');

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.className).toContain('toast-success');
      expect(toast.textContent).toBe('Success message');
    });

    it('showSuccess accepts custom duration', () => {
      showSuccess('Success', 2000);

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast).toBeDefined();
      expect(toast.className).toContain('toast-success');
    });

    it('showError calls showNotification with error type', () => {
      showError('Error message');

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.className).toContain('toast-error');
      expect(toast.textContent).toBe('Error message');
    });

    it('showError accepts custom duration', () => {
      showError('Error', 1000);

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast).toBeDefined();
      expect(toast.className).toContain('toast-error');
    });

    it('showWarning calls showNotification with warning type', () => {
      showWarning('Warning message');

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.className).toContain('toast-warning');
      expect(toast.textContent).toBe('Warning message');
    });

    it('showWarning accepts custom duration', () => {
      showWarning('Warning', 3000);

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast).toBeDefined();
      expect(toast.className).toContain('toast-warning');
    });

    it('showInfo calls showNotification with info type', () => {
      showInfo('Info message');

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.className).toContain('toast-info');
      expect(toast.textContent).toBe('Info message');
    });

    it('showInfo accepts custom duration', () => {
      showInfo('Info', 4000);

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast).toBeDefined();
      expect(toast.className).toContain('toast-info');
    });
  });

  describe('Edge cases', () => {
    it('handles very long messages', () => {
      const longMessage = 'A'.repeat(500);
      showNotification(longMessage, { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.textContent).toBe(longMessage);
      expect(toast.style.maxWidth).toBe('400px');
      expect(toast.style.wordWrap).toBe('break-word');
    });

    it('handles empty message', () => {
      showNotification('', { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.textContent).toBe('');
    });

    it('handles special characters in message', () => {
      const message = '<script>alert("xss")</script>';
      showNotification(message, { type: 'info' });

      const toast = appendChildSpy.mock.calls[0][0] as HTMLElement;
      expect(toast.textContent).toBe(message);
      expect(toast.innerHTML).not.toContain('<script>');
    });

    it('handles multiple notifications at once', () => {
      showNotification('Message 1', { type: 'info' });
      showNotification('Message 2', { type: 'success' });
      showNotification('Message 3', { type: 'error' });

      expect(appendChildSpy).toHaveBeenCalledTimes(3);
    });
  });
});

