import { Elysia, status } from "elysia";
import { users } from "./users";


export const protectedRoutes = new Elysia()
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
        const filtered = users.filter(
          (u) => u.secret === bearer && u.role === "admin"
        );
        if (filtered.length == 0) return status(401);
      },
    }
  );
