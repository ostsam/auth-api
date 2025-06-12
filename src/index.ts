import swagger from "@elysiajs/swagger";
import { Elysia, status, t } from "elysia";
import { users } from "./users";
import { protectedRoutes } from "./protectedroutes";
import { cookie } from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
const PORT = 3000;

if (process.env.JWT_TOKEN === undefined) {
  throw new Error("JWT secret is missing!");
}

const app = new Elysia()
  .use(swagger({ path: "/api-docs" }))
  .use(cookie())
  .get("/", () => {
    return { message: "this is a public directory" };
  })
  .use(protectedRoutes)
  .group("/api", (app) => {
    app
      .use(
        jwt({
          name: "jwt",
          secret: process.env.JWT_TOKEN!,
        })
      )
      .post(
        "/login",
        async ({ jwt, body, cookie: { auth } }) => {
          const verifiedUser = users.filter(
            (u) => u.username == body.username && u.password == body.password
          );
          if (verifiedUser.length == 0) return status(401);
          const role = verifiedUser[0].role;
          const id = verifiedUser[0].id;
          const signedJWT = await jwt.sign({ id, role, exp: "10m" });
          console.log(signedJWT);

          auth.set({
            value: signedJWT,
            httpOnly: true,
            maxAge: 7 * 86400,
            path: "/",
          });

          return "You are signed in!";
        },
        {
          body: t.Object({
            username: t.String(),
            password: t.String(),
          }),
        }
      )
      .get("/chat", async (requestData) => {
        const jwt = requestData.jwt;
        const cookie = requestData.cookie;
        const auth = cookie.auth;
        const authValue = await jwt.verify(auth.value);
        if (!authValue) return status(401);
        return authValue;
      });
    return app;
  })

  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
