import { cn } from './utils';

describe('utils.cn', () => {
  it('merges class names and removes falsy values', () => {
    const result = cn('a', undefined, 'b', false && 'c', 'd');
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('d');
    expect(result).not.toContain('c');
  });

  it('merges tailwind classes correctly (later overrides earlier)', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });
});
