import { showNotification, showSuccess, showError, showWarning, showInfo } from './notifications';

jest.useFakeTimers();

describe('notifications', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const style = document.getElementById('toast-animations');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  });

  it('creates and removes a toast after duration', () => {
    showNotification('Hello', { type: 'info', duration: 100 });

    const toast = document.querySelector('.toast.toast-info') as HTMLElement;
    expect(toast).toBeTruthy();
    expect(toast.textContent).toBe('Hello');

    jest.advanceTimersByTime(120);

    // Wait for slideOut timeout (300ms)
    jest.advanceTimersByTime(300);

    expect(document.querySelector('.toast')).toBeNull();
  });

  it('adds animation styles only once', () => {
    showNotification('One', { type: 'success', duration: 0 });
    showNotification('Two', { type: 'success', duration: 0 });

    const styles = document.querySelectorAll('#toast-animations');
    expect(styles.length).toBe(1);
  });

  it('supports helpers for types', () => {
    showSuccess('ok', 0);
    showError('err', 0);
    showWarning('warn', 0);
    showInfo('info', 0);

    expect(document.querySelector('.toast.toast-success')).toBeTruthy();
    expect(document.querySelector('.toast.toast-error')).toBeTruthy();
    expect(document.querySelector('.toast.toast-warning')).toBeTruthy();
    expect(document.querySelector('.toast.toast-info')).toBeTruthy();
  });
});
