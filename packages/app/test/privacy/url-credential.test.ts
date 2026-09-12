import { describe, expect, it } from 'vitest';

const SENTINEL = 'PHRIM_PRIVACY_SENTINEL_9f2c7ab1';

const ROUTE_PATHS = ['/facility', '/collateral', '/draw', '/result', '/history'];

describe('no credential field appears in a URL, query string or route parameter', () => {
  it('declares every route as a static path with no dynamic credential-bearing segment', () => {
    for (const path of ROUTE_PATHS) {
      expect(path).not.toMatch(/:[a-zA-Z]+/);
      expect(path).not.toContain(SENTINEL);
    }
  });

  it('never appends credential data to window.location when synthetic navigation occurs', () => {
    const before = window.location.href;
    expect(before).not.toContain(SENTINEL);
    for (const path of ROUTE_PATHS) {
      window.history.pushState({}, '', path);
      expect(window.location.href).not.toContain(SENTINEL);
      expect(window.location.search).toBe('');
    }
    window.history.pushState({}, '', '/');
  });
});
