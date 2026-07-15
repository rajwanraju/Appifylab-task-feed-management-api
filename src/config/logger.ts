import pino from "pino";

const isLocal =
  process.env.NODE_ENV === "development" && !process.env.VERCEL;

const logger = isLocal
  ? pino(
      pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      })
    )
  : pino();

export default logger;