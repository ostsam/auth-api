import { Elysia, status } from "elysia";
import jwt from "@elysiajs/jwt";
import { users } from "./users";

export const protectedRoutes = new Elysia()
  .derive(({ headers }) => {
    const auth = headers["authorization"];
    return {
      bearer: auth?.startsWith("Bearer") ? auth.slice(7) : null,
    };
  })
  .use(
    jwt({
      name: "jwt",
      secret:
        "739dddaf3e4c19f75921fa6823563402165a50a1a9de9784a8056766b50a2291",
    })
  )
  .get("sign/:name", async ({ jwt, params: { name }, cookie: { auth } }) => {
    const value = await jwt.sign({ name });

    auth.set({
      value,
      httpOnly: true,
      maxAge: 7 * 86400,
      path: "/api/login",
    });

    return `Sign in as ${value}`;
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
        const filtered = users.filter(
          (u) => u.secret === bearer && u.role === "admin"
        );
        if (filtered.length == 0) return status(401);
      },
    }
  );
