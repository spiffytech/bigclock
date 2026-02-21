import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { ServerSentEventGenerator } from "@starfederation/datastar-sdk/web";
import { Temporal } from "temporal-polyfill";

const Layout = ({
  title = "Big Clock",
  children,
}: {
  title?: string;
  children?: unknown;
}) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="A modern web application" />
      <meta name="theme-color" content="#0f172a" />
      <title>{title}</title>
      <link rel="stylesheet" href="/styles.css" />
      <script
        type="module"
        src="https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.0-RC.7/bundles/datastar.js"
      ></script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen antialiased">
      {children}
    </body>
  </html>
);

const Home = () => (
  <div
    id="app"
    data-init="@get('/time')"
    class="flex flex-col items-center justify-center min-h-screen gap-8"
  >
    <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500">
      Big Clock
    </h1>
    <div id="clock" class="text-6xl font-mono text-cyan-400">
      --:--:--
    </div>
    <p class="text-slate-400">Real-time clock powered by Datastar SSE</p>
  </div>
);

const ClockDisplay = () => {
  const now = new Date().toLocaleTimeString();
  return (
    <div id="clock" class="text-6xl font-mono text-cyan-400">
      {now}
    </div>
  );
};

const app = new Hono();

app.use("/styles.css", serveStatic({ path: "./public/styles.css" }));

app.get("/", (c) => {
  return c.html(
    <Layout>
      <Home />
    </Layout>,
  );
});

app.get("/time", () => {
  return ServerSentEventGenerator.stream(
    async (stream) => {
      stream.patchElements(await (<ClockDisplay />).toString());
      while (true) {
        const now = Temporal.Now.instant();
        const msUntilNextSecond = 1000 - (now.epochMilliseconds % 1000);
        await Bun.sleep(msUntilNextSecond);
        stream.patchElements(await (<ClockDisplay />).toString());
      }
    },
    { keepalive: true },
  );
});

export default app;
