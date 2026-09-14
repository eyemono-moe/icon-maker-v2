import { createMiddleware } from "@solidjs/start/middleware";
import { setResponseHeaders } from "vinxi/http";
import { createSecurityHeaders } from "~/lib/securityHeaders";

export default createMiddleware({
  onRequest(event) {
    const cspNonce = crypto.randomUUID().replaceAll("-", "");
    event.locals.cspNonce = cspNonce;
    setResponseHeaders(createSecurityHeaders(cspNonce));
  },
});
