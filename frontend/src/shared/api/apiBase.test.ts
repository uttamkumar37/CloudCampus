import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl, configureCloudCampusApiFetch } from './apiBase';

describe('deployment API base URL support', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps same-origin API paths when no API base is configured', () => {
    expect(buildApiUrl('/v1/me', '')).toBe('/v1/me');
  });

  it('prefixes CloudCampus API paths when a deployment API base is configured', () => {
    expect(buildApiUrl('/v1/me', 'https://api.cloudcampus.example/')).toBe(
      'https://api.cloudcampus.example/v1/me',
    );
    expect(buildApiUrl('/actuator/health/readiness', 'https://api.cloudcampus.example')).toBe(
      'https://api.cloudcampus.example/actuator/health/readiness',
    );
  });

  it('does not rewrite static assets or already absolute URLs', () => {
    expect(buildApiUrl('/assets/app.js', 'https://api.cloudcampus.example')).toBe('/assets/app.js');
    expect(buildApiUrl('https://other.example/v1/me', 'https://api.cloudcampus.example')).toBe(
      'https://other.example/v1/me',
    );
  });

  it('rewrites fetch calls for API paths only', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);

    const restore = configureCloudCampusApiFetch('https://api.cloudcampus.example/');

    await fetch('/v1/me');
    await fetch('/assets/app.js');
    restore();

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://api.cloudcampus.example/v1/me', undefined);
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/assets/app.js', undefined);
  });
});
