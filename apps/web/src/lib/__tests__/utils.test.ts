import { cn } from '../utils';

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible');
      expect(result).toContain('base');
      expect(result).toContain('visible');
      expect(result).not.toContain('hidden');
    });

    it('merges tailwind classes correctly', () => {
      const result = cn('p-4', 'p-8');
      // Should keep only the last padding class
      expect(result).toBe('p-8');
    });

    it('handles empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles arrays', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('handles objects', () => {
      const result = cn({ 'class1': true, 'class2': false });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
    });
  });
});

