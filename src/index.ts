import { Hono } from "hono";
import { contextStorage, getContext } from "hono/context-storage";
import { html } from "hono/html";
type Env = {
  Variables: {
    counter: number;
  };
};

const app = new Hono<Env>();
const MIN_VALUE = -10;
const MAX_VALUE = 500;
app.use(contextStorage());

app.use(async (c, next) => {
  let counter = c.get("counter") as number | undefined;
  if (!counter) {
    counter = 0;
  }
  counter = Math.max(MIN_VALUE, Math.min(MAX_VALUE, counter));
  c.set("counter", counter);
  await next();
});

app.get("/", (c) => {
  return c.html(
    html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
            rel="stylesheet"
          />
          <title>Context Hono</title>
        </head>
        <body
          class="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8 text-center">Counter App</h1>

            <div class="max-w-md mx-auto">
              <div
                class="rounded-lg border border-white/60 dark:border-border/30"
              >
                <div
                  class="border dark:border-neutral-900/80 border-black/10 rounded-[calc(var(--radius)-1px)]"
                >
                  <div
                    class="border dark:border-neutral-950 border-white/50 rounded-[calc(var(--radius)-2px)]"
                  >
                    <div
                      class="border dark:border-neutral-900/70 border-neutral-950/20 rounded-[calc(var(--radius)-3px)]"
                    >
                      <div
                        class="w-full border border-white/50 dark:border-neutral-700/50 text-neutral-500 bg-gradient-to-b from-card/70 to-secondary/50 rounded-[calc(var(--radius)-4px)] p-6"
                      >
                        <h2 class="text-2xl font-bold mb-4 text-center">
                          Counter Value
                        </h2>
                        <p
                          id="counter"
                          class="text-6xl font-bold text-center mb-8"
                        >
                          0
                        </p>
                        <div class="flex justify-center space-x-4">
                          <button
                            id="decrement"
                            class="relative w-full flex items-center justify-center text-sm transition duration-300 ease-in-out border px-4 py-2 rounded-[12px] border-black/20 bg-white/50 dark:border-neutral-950 dark:bg-neutral-600/50 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-800"
                          >
                            Decrement
                          </button>
                          <button
                            id="increment"
                            class="relative w-full flex items-center justify-center text-sm transition duration-300 ease-in-out border border-black/10 dark:border-neutral-950 bg-gradient-to-b from-indigo-300/90 to-indigo-500 dark:from-indigo-200/70 dark:to-indigo-500 text-white/90 hover:from-indigo-400/70 hover:to-indigo-600/70 active:from-indigo-400/80 active:to-indigo-600/80"
                          >
                            Increment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <script>
            const counter = document.getElementById("counter");
            const incrementBtn = document.getElementById("increment");
            const decrementBtn = document.getElementById("decrement");

            let count = 0;

            async function updateCounter() {
              counter.innerText = count;
            }

            incrementBtn.addEventListener("click", async () => {
              const response = await fetch("/counter/increment", {
                method: "POST",
              });
              const data = await response.json();
              count = data.counter;
              console.log(count);
              updateCounter();
            });

            decrementBtn.addEventListener("click", async () => {
              const response = await fetch("/counter/decrement", {
                method: "POST",
              });
              const data = await response.json();
              count = data.counter;
              console.log(count);
              updateCounter();
            });

            updateCounter();
          </script>
        </body>
      </html> `
  );
});
app.post("/counter/increment", async (c) => {
  let counter = getContext<Env>().var.counter;
  let newCounter = Math.min(MAX_VALUE, counter + 1);
  console.log(newCounter);
  c.set("counter", newCounter);
  return c.json({ counter: newCounter });
});

app.post("/counter/decrement", async (c) => {
  let counter = getContext<Env>().var.counter as number;
  let newCounter = Math.max(MIN_VALUE, counter - 1);
  console.log({ counter: newCounter });
  c.set("counter", newCounter);
  return c.json({ counter: newCounter });
});

export default app;
