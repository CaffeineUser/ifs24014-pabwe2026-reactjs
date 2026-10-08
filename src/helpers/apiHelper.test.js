import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  apiHelper,
  getAccessToken,
  putAccessToken,
} from './apiHelper';

describe('access token helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads and stores an access token', () => {
    expect(getAccessToken()).toBeNull();

    putAccessToken('test-token');

    expect(getAccessToken()).toBe('test-token');
  });

  it('removes the access token when an empty value is provided', () => {
    putAccessToken('test-token');
    putAccessToken(null);

    expect(getAccessToken()).toBeNull();
  });
});

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a JSON request to the configured API base URL', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: 'result' }),
    });

    await expect(apiHelper('/users')).resolves.toEqual({ data: 'result' });
    expect(fetch).toHaveBeenCalledWith(
      `${DELCOM_BASEURL}/users`,
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('includes the access token and custom request options', async () => {
    putAccessToken('test-token');
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await apiHelper('/users/me', {
      method: 'PUT',
      headers: { 'X-Request-Id': 'request-1' },
      body: JSON.stringify({ name: 'Ada' }),
    });

    expect(fetch).toHaveBeenCalledWith(
      `${DELCOM_BASEURL}/users/me`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('test-token'),
          'X-Request-Id': 'request-1',
        }),
      }),
    );
  });

  it('lets the browser set the multipart content type for FormData', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    const body = new FormData();
    body.append('file', new File(['image'], 'image.png'));

    await apiHelper('/upload', { method: 'POST', body });

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
  });

  it('throws the API error message for an unsuccessful response', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Not authorized' }),
    });

    await expect(apiHelper('/private')).rejects.toThrow('Not authorized');
  });

  it('uses a fallback message when the API error has no message', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(apiHelper('/private')).rejects.toThrow(
      'Something went wrong',
    );
  });

  it('propagates network errors', async () => {
    fetch.mockRejectedValue(new Error('Network unavailable'));

    await expect(apiHelper('/users')).rejects.toThrow(
      'Network unavailable',
    );
  });
});
