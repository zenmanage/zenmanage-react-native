import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFlagsContext } from '../src/context';

describe('useFlagsContext', () => {
  it('throws when used without provider', () => {
    expect(() => renderHook(() => useFlagsContext())).toThrow(
      'Zenmanage React Native hooks must be used within <FlagsProvider>.'
    );
  });
});
