const PORT = process.env.PORT ?? 3000;

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": async (req) => {
      return new Response("working perfectly fine ");
    },
    "/temp": async (req) => {
      return new Response("");
    },
    "/humd": async (req) => {
      return new Response("");
    },
    "/dist": async (req) => {
      return new Response("");
    },
    "/video": async (req) => {
      return new Response("");
    },
  }
});

console.log(`running on ${server.hostname}:${server.port}`);
