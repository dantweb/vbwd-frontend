const SECRET = import.meta.env.VITE_PLUGIN_API_SECRET || '';

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signRequest(
  method: string,
  path: string,
  body?: string
): Promise<{ timestamp: string; signature: string }> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const message = `${method}:${path}:${timestamp}:${body || ''}`;
  const signature = await hmacSha256(SECRET, message);
  return { timestamp, signature };
}
