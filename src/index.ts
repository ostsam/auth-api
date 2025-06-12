import swagger from "@elysiajs/swagger";
import { Elysia, status, t } from "elysia";
import { users } from "./users";
import { protectedRoutes } from "./protectedroutes";

const PORT = 3000;

const app = new Elysia()
  .use(swagger({ path: "/api-docs" }))
  .get("/", () => {
    return { message: "this is a public directory" };
  })
  .use(protectedRoutes)
  .post(
    "/api/login",

    async ({ body: { username, password }, jwt }) => {
      const verifiedUser = users.filter(
        (u) => u.username == username && u.password == password
      );
      if (!verifiedUser.length) return status(401);
      const role = verifiedUser[0].role;
      const id = verifiedUser[0].id;
      const signedJWT = await jwt.sign({ id, role, exp: "1m" });
      console.log(signedJWT);
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
