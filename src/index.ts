import { Elysia } from "elysia";

new Elysia()
  .get("/", () => "Hello Elysia")
  .listen(3000)
  .get("/api/public", () => "This is public information.")
  .get("/api/protected", () => "Only admin should be able to see this.");
