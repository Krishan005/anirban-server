import logger from "pino";
import dayjs from "dayjs";

// const log = logger({
//   base: { pid: false },
//   timestamp: () => `time:${dayjs().format()}`,
// });

const levels = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const transport = logger.transport({
  target: "pino-pretty",
  options: { colorize: true },
});

const log = logger(
  {
    customLevels: levels,
    useOnlyCustomLevels: true,
    level: "info",
    base: { pid: false },
    timestamp: () => `time:${dayjs().format()}`,
  },
  transport
);

export default log;
