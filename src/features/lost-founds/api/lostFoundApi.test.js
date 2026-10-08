import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiHelper } from '../../../helpers/apiHelper';
import {
  addLostFound,
  deleteLostFound,
  getLostFoundById,
  getLostFounds,
  getStatsDaily,
  getStatsMonthly,
  updateCover,
  updateLostFound,
} from './lostFoundApi';

vi.mock('../../../helpers/apiHelper', () => ({
  apiHelper: vi.fn(),
}));

describe('lost and found API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a query from supplied filters and omits empty filters', () => {
    getLostFounds({
      status: 'lost',
      is_completed: '0',
      is_me: 1,
    });
    expect(apiHelper).toHaveBeenLastCalledWith(
      '/lost-founds?status=lost&is_completed=0&is_me=1',
    );

    getLostFounds({ status: '', is_completed: '', is_me: 0 });
    expect(apiHelper).toHaveBeenLastCalledWith('/lost-founds');
    getLostFounds();
    expect(apiHelper).toHaveBeenLastCalledWith('/lost-founds');
  });

  it('gets a lost and found report by ID', () => {
    getLostFoundById(12);
    expect(apiHelper).toHaveBeenCalledWith('/lost-founds/12');
  });

  it('creates a report', () => {
    addLostFound('Wallet', 'Black wallet', 'lost');
    expect(apiHelper).toHaveBeenCalledWith('/lost-founds', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Wallet',
        description: 'Black wallet',
        status: 'lost',
      }),
    });
  });

  it('updates a report', () => {
    updateLostFound(12, 'Wallet', 'Found wallet', 'found', 1);
    expect(apiHelper).toHaveBeenCalledWith('/lost-founds/12', {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Wallet',
        description: 'Found wallet',
        status: 'found',
        is_completed: 1,
      }),
    });
  });

  it('uploads a report cover as multipart form data', () => {
    const file = new File(['cover'], 'cover.png');
    updateCover(12, file);

    expect(apiHelper).toHaveBeenCalledWith(
      '/lost-founds/12/cover',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(apiHelper.mock.calls[0][1].body.get('cover')).toBe(file);
  });

  it('deletes a report and requests daily and monthly statistics', () => {
    deleteLostFound(12);
    getStatsDaily();
    getStatsMonthly();

    expect(apiHelper).toHaveBeenNthCalledWith(1, '/lost-founds/12', {
      method: 'DELETE',
    });
    expect(apiHelper).toHaveBeenNthCalledWith(
      2,
      '/lost-founds/stats/daily',
    );
    expect(apiHelper).toHaveBeenNthCalledWith(
      3,
      '/lost-founds/stats/monthly',
    );
  });
});
