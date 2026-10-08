import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as lostFoundApi from '../api/lostFoundApi';
import reducer, {
  addLostFoundAsync,
  deleteLostFoundAsync,
  getLostFoundByIdAsync,
  getLostFoundsAsync,
  resetLostFoundStatus,
  updateCoverAsync,
  updateLostFoundAsync,
} from './lostFoundSlice';

vi.mock('../api/lostFoundApi', () => ({
  addLostFound: vi.fn(),
  deleteLostFound: vi.fn(),
  getLostFoundById: vi.fn(),
  getLostFounds: vi.fn(),
  updateCover: vi.fn(),
  updateLostFound: vi.fn(),
}));

const createTestStore = () => configureStore({ reducer });

describe('lost and found slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides the initial state and resets operation status flags', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    expect(initialState).toMatchObject({
      lostFounds: [],
      lostFound: null,
      isLostFound: false,
      isLostFoundAdd: false,
      isLostFoundAdded: false,
      error: null,
    });

    const reset = reducer(
      {
        ...initialState,
        isLostFoundAdded: true,
        isLostFoundChanged: true,
        isLostFoundChangedCover: true,
        isLostFoundDeleted: true,
        error: 'previous error',
      },
      resetLostFoundStatus(),
    );

    expect(reset).toMatchObject({
      isLostFoundAdded: false,
      isLostFoundChanged: false,
      isLostFoundChangedCover: false,
      isLostFoundDeleted: false,
      error: null,
    });
  });

  it('loads reports and falls back to an empty list when the response omits them', async () => {
    const store = createTestStore();
    lostFoundApi.getLostFounds.mockResolvedValueOnce({
      data: { lost_founds: [{ id: 1, title: 'Wallet' }] },
    });
    await store.dispatch(getLostFoundsAsync({ status: 'lost' }));
    expect(store.getState()).toMatchObject({
      isLostFound: false,
      lostFounds: [{ id: 1, title: 'Wallet' }],
    });

    lostFoundApi.getLostFounds.mockResolvedValueOnce({ data: {} });
    await store.dispatch(getLostFoundsAsync({}));
    expect(store.getState().lostFounds).toEqual([]);
  });

  it('loads a report by ID', async () => {
    const report = { id: 1, title: 'Wallet' };
    lostFoundApi.getLostFoundById.mockResolvedValue({
      data: { lost_found: report },
    });
    const store = createTestStore();

    await store.dispatch(getLostFoundByIdAsync(1));

    expect(store.getState()).toMatchObject({
      isLostFound: false,
      lostFound: report,
    });
  });

  it('adds and updates a report', async () => {
    const store = createTestStore();
    lostFoundApi.addLostFound.mockResolvedValue({ data: { id: 2 } });
    await store.dispatch(
      addLostFoundAsync({
        title: 'Keys',
        description: 'Blue keys',
        status: 'lost',
      }),
    );
    expect(store.getState()).toMatchObject({
      isLostFoundAdd: false,
      isLostFoundAdded: true,
    });

    const updated = { id: 2, title: 'Keys found' };
    lostFoundApi.updateLostFound.mockResolvedValue({
      data: { lost_found: updated },
    });
    await store.dispatch(
      updateLostFoundAsync({
        id: 2,
        title: 'Keys found',
        description: 'Blue keys',
        status: 'found',
        is_completed: 1,
      }),
    );
    expect(store.getState()).toMatchObject({
      isLostFoundChange: false,
      isLostFoundChanged: true,
      lostFound: updated,
    });
  });

  it('updates a cover when a report is loaded and when no report is loaded', async () => {
    const store = createTestStore();
    lostFoundApi.updateCover.mockResolvedValue({
      data: { lost_found: { cover: '/cover.png' } },
    });
    await store.dispatch(updateCoverAsync({ id: 1, coverFile: new File([], 'cover.png') }));
    expect(store.getState()).toMatchObject({
      isLostFoundChangeCover: false,
      isLostFoundChangedCover: true,
      lostFound: null,
    });

    lostFoundApi.getLostFoundById.mockResolvedValue({
      data: { lost_found: { id: 1, cover: '/old.png' } },
    });
    await store.dispatch(getLostFoundByIdAsync(1));
    await store.dispatch(updateCoverAsync({ id: 1, coverFile: new File([], 'cover.png') }));
    expect(store.getState().lostFound.cover).toBe('/cover.png');
  });

  it('deletes a report from the list', async () => {
    const store = createTestStore();
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: [{ id: 1 }, { id: 2 }] },
    });
    await store.dispatch(getLostFoundsAsync({}));
    lostFoundApi.deleteLostFound.mockResolvedValue({});

    await store.dispatch(deleteLostFoundAsync(1));

    expect(store.getState()).toMatchObject({
      isLostFoundDelete: false,
      isLostFoundDeleted: true,
      lostFounds: [{ id: 2 }],
    });
  });

  it.each([
    ['getLostFounds', getLostFoundsAsync, 'getLostFounds'],
    ['getLostFoundById', getLostFoundByIdAsync, 'getLostFoundById'],
    ['addLostFound', addLostFoundAsync, 'addLostFound'],
    ['updateLostFound', updateLostFoundAsync, 'updateLostFound'],
    ['updateCover', updateCoverAsync, 'updateCover'],
    ['deleteLostFound', deleteLostFoundAsync, 'deleteLostFound'],
  ])('stores API errors from %s', async (name, thunk, apiMethod) => {
    lostFoundApi[apiMethod].mockRejectedValue(new Error(`${name} failed`));
    const store = createTestStore();

    const action = await store.dispatch(thunk({ id: 1 }));

    expect(action.payload).toBe(`${name} failed`);
    expect(store.getState().error).toBe(`${name} failed`);
  });
});
