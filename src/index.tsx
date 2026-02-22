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
      <link rel="icon" href="https://fav.farm/🕐" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="stylesheet" href="/styles.css" />
      <script
        type="module"
        src="https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.0-RC.7/bundles/datastar.js"
      ></script>
      <script type="module" src="/clock.js"></script>
      <script>
        if('serviceWorker'in
        navigator)navigator.serviceWorker.register('/sw.js')
      </script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen antialiased">
      {children}
    </body>
  </html>
);

const Home = () => (
  <div
    id="app"
    data-init="@get('/time?tz=' + encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone))"
    style="height: 100dvh; display: flex; align-items: center; justify-content: center;"
  >
    <div
      id="clock-sizing-wrapper"
      style="color: var(--color-cyan-400); font-weight: bold; text-align: center;"
    >
      <div id="clock" style="line-height: 1;">
        <div>--</div>
        <div>--</div>
      </div>
    </div>
  </div>
);

const ClockDisplay = ({ timezone }: { timezone: string }) => {
  const now = Temporal.Now.zonedDateTimeISO(timezone);
  const hours = now.hour.toString().padStart(2, "0");
  const minutes = now.minute.toString().padStart(2, "0");
  return (
    <div
      id="clock"
      data-init="resizeClock()"
      style="display: flex; justify-content: space-between; line-height: 1; width: 100%;"
    >
      <div>
        <div>{hours}</div>
        <div>{minutes}</div>
      </div>
    </div>
  );
};

const app = new Hono();

app.use("/*", serveStatic({ root: "./public" }));

app.get("/", (c) => {
  return c.html(
    <Layout>
      <Home />
    </Layout>,
  );
});

app.get("/time", (c) => {
  const timezone = c.req.query("tz") || "UTC";
  return ServerSentEventGenerator.stream(
    async (stream) => {
      stream.patchElements(await (<ClockDisplay timezone={timezone} />).toString());
      while (true) {
        const now = Temporal.Now.instant();
        const msUntilNextMinute = 60000 - (now.epochMilliseconds % 60000);
        await Bun.sleep(msUntilNextMinute);
        stream.patchElements(await (<ClockDisplay timezone={timezone} />).toString());
      }
    },
    { keepalive: true },
  );
});

export default app;
