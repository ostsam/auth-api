import swagger from "@elysiajs/swagger";
import { Elysia, status } from "elysia";

const PORT = 3000;

const validApiKeys = new Set(["api-key-123", "api-key-456"]);

const protectedRoutes = new Elysia()
  .derive({ as: "local" }, (request) => {
    return {
      user: { name: "sam", role: "admin" },
      isAuthenticated: true,
    };
  })
  .onBeforeHandle({ as: "local" }, (request) => {
    const headers = request.headers;
    const apiKey = headers["x-api-key"];

    if (!apiKey) return status(401);

    const isAuthenticated = validApiKeys.has(apiKey);

    if (!isAuthenticated) return status(401);

    if (request.user.role !== "admin") return status(401);
  })
  .get("/protected", () => {
    return {
      message: "[hacker voice] you're in. now try /protected-with-context",
    };
  })
  .get("/protected-with-context", ({ user, isAuthenticated }) => {
    return {
      message: "Enhance the pixels.",
      user: user,
      authenticated: isAuthenticated,
    };
  });

const app = new Elysia()
  .use(swagger({ path: "/api-docs" }))
  .get("/", () => {
    return { message: "this is a public directory" };
  })
  .use(protectedRoutes)
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
