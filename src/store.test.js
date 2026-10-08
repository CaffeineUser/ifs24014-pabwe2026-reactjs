import { describe, expect, it } from 'vitest';
import store from './store';

describe('application store', () => {
  it('registers all feature reducers', () => {
    expect(Object.keys(store.getState())).toEqual([
      'auth',
      'users',
      'lostFounds',
    ]);
  });
});
