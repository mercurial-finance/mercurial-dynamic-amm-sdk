import { pino } from 'pino';
export const logger = pino({
  name: "DynamicAmm",
  level: process.env.LOG_LEVEL || "info"
});