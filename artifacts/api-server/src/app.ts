import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global fallback so any unhandled route error (thrown sync or rejected async —
// Express 5 forwards async rejections to `next(err)` automatically) returns a
// JSON error the frontend can interpret, instead of an opaque failure.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err });
  res.status(500).json({ error: "Internal server error" });
});

export default app;
