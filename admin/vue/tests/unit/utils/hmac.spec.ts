import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock import.meta.env
vi.stubEnv('VITE_PLUGIN_API_SECRET', 'test-secret-at-least-32-characters-long');

// Mock Web Crypto API
const mockSign = vi.fn();
const mockImportKey = vi.fn();

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      importKey: mockImportKey,
      sign: mockSign
    }
  },
  writable: true
});

describe('HMAC Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImportKey.mockResolvedValue('mock-key');
    // Return a fixed ArrayBuffer representing a known hash
    const fixedBytes = new Uint8Array(32).fill(0xab);
    mockSign.mockResolvedValue(fixedBytes.buffer);
  });

  it('should generate timestamp and signature', async () => {
    const { signRequest } = await import('@/utils/hmac');
    const result = await signRequest('GET', '/_plugins');

    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('signature');
    expect(result.timestamp).toMatch(/^\d+$/);
    expect(result.signature).toMatch(/^[0-9a-f]+$/);
  });

  it('should include body in signature for PUT requests', async () => {
    const { signRequest } = await import('@/utils/hmac');
    const body = JSON.stringify({ heroTitle: 'New Title' });

    await signRequest('PUT', '/_plugins/landing1/config', body);

    expect(mockSign).toHaveBeenCalled();
    // The message should include the body
    const callArgs = mockSign.mock.calls[0];
    const msgData = callArgs[2];
    const decoded = new TextDecoder().decode(msgData);
    expect(decoded).toContain(body);
  });

  it('should use empty string for body when not provided', async () => {
    const { signRequest } = await import('@/utils/hmac');

    await signRequest('GET', '/_plugins');

    expect(mockSign).toHaveBeenCalled();
    const callArgs = mockSign.mock.calls[0];
    const msgData = callArgs[2];
    const decoded = new TextDecoder().decode(msgData);
    expect(decoded).toMatch(/:$/);
  });

  it('should use current timestamp', async () => {
    const { signRequest } = await import('@/utils/hmac');
    const before = Math.floor(Date.now() / 1000);
    const result = await signRequest('GET', '/_plugins');
    const after = Math.floor(Date.now() / 1000);

    const ts = parseInt(result.timestamp, 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
