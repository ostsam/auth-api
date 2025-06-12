import swagger from "@elysiajs/swagger";
import { Elysia, status, t } from "elysia";
import jwt from "@elysiajs/jwt";

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
      async beforeHandle({ bearer, cookie: { auth }, jwt, redirect }) {
        if (!bearer) return status(401);
        const filtered = users.filter(
          (u) => u.secret === bearer && u.role === "admin"
        );
        if (filtered.length == 0) return status(401);
        if (!auth) {
          return status(401);
        }

        const decodeAuth = await jwt.verify(auth.value);
        if (!decodeAuth) return status(401);
        if (decodeAuth.role != "admin") return status(401);
      },
    }
  );
const app = new Elysia()
  .use(swagger({ path: "/api-docs" }))
  .get("/", () => {
    return { message: "this is a public directory" };
  })
  .use(protectedRoutes)
  .post(
    "/api/login",
    async ({ body: { username, password }, jwt, cookie: { auth } }) => {
      const verifiedUser = users.filter(
        (u) => u.username == username && u.password == password
      );
      if (!verifiedUser.length) return status(401);
      const role = verifiedUser[0].role;
      const id = verifiedUser[0].id;
      const signedJWT = await jwt.sign({ id, role, exp: "1m" });
      console.log(signedJWT);
      auth.set({
        value: signedJWT,
        expires: new Date(Date.now() + 3600 * 1000 * 24),
      });
      console.log(auth);
      console.log("auth.value is:", auth.value);
      console.log("auth expires at:", auth.expires);
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
