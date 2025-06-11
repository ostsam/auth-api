import swagger from "@elysiajs/swagger";
import { Elysia, status } from "elysia";
import { bearer } from "@elysiajs/bearer";

const PORT = 3000;

const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "admin",
    secret: "admin-secret-123",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    role: "basic",
    secret: "user-secret-456",
  },
];


const protectedRoutes = new Elysia()
  .derive(({ headers }) => {
    const auth = headers["authorization"];
    return {
      bearer: auth?.startsWith("Bearer") ? auth.slice(7) : null,
    };
  })
  .get(
    "/api/protected",
    (bearer) => {
      console.log(bearer);
      return { message: "Get out of here!" };
    },
    {
      beforeHandle({ bearer }) {
        if (!bearer) return status(401);
        const filtered = users.filter((u) => u.secret === bearer && u.role === "admin")
        if (filtered.length == 0) return status(401)

      },
    }
  );
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
