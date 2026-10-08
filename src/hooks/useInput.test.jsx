import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useInput from './useInput';

describe('useInput', () => {
  it('tracks, resets, and explicitly sets the input value', () => {
    const { result } = renderHook(() => useInput('initial'));

    act(() => {
      result.current[1]({ target: { value: 'updated' } });
    });
    expect(result.current[0]).toBe('updated');

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[3]('set directly');
    });
    expect(result.current[0]).toBe('set directly');
  });

  it('defaults to an empty string', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe('');
  });
});
