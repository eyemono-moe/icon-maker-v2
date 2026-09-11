import { describe, expect, it } from "vitest";
import { createSecurityHeaders } from "./securityHeaders";

describe("securityHeaders", () => {
  it("defines the browser security policy shared by every response", () => {
    const securityHeaders = createSecurityHeaders("test-nonce");

    expect(securityHeaders).toMatchObject({
      "Content-Security-Policy": expect.stringContaining("default-src 'self'"),
      "Permissions-Policy": "camera=(self)",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
    });
    expect(securityHeaders["Content-Security-Policy"]).toContain(
      "https://cdn.jsdelivr.net",
    );
    expect(securityHeaders["Content-Security-Policy"]).toContain(
      "https://storage.googleapis.com",
    );
    expect(securityHeaders["Content-Security-Policy"]).toContain(
      "'nonce-test-nonce'",
    );
  });
});
