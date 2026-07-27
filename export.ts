import { createApp } from "../app";

// Vercel's Node.js runtime accepts a standard (req, res) handler.
// An Express app instance IS such a handler, so exporting it directly
// works without needing `serverless-http` -- Vercel calls
// `app(req, res)` under the hood for every request routed here by
// vercel.json's rewrites.
const app = createApp();

export default app;
