/** loopback の JSON API 呼び出し。body は UTF-8 の JSON として送る (日本語が化けない)。 */
export async function requestJson(base, method, path, body, { headers = {}, timeoutMs = 30_000 } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status} ${text.slice(0, 200)}`);
  }
  return json;
}

export async function reachable(base, path, timeoutMs = 3_000) {
  try {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(timeoutMs) });
    return response.ok;
  } catch {
    return false;
  }
}
