export function createSecurityHeaders(nonce: string) {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "object-src 'none'",
      `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' https://cdn.jsdelivr.net`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "worker-src 'self' blob:",
    ].join("; "),
    "Permissions-Policy": "camera=(self)",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
  } as const satisfies Record<string, string>;
}
