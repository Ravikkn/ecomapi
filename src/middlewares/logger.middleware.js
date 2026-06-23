import fs from "fs";
//import { format } from 'path';
import winston from "winston";

const fspromises = fs.promises;

// async function log(logData) {
//     try{
//     logData = `\n ${new Date().toString()} Log Data: ${logData}`;
//        await fspromises.appendFile('log.txt', logData)
//     }catch(err){
// console.log(err);
//     }
// }

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "request-logging" },
  transports: [new winston.transports.File({ filename: "logs.txt" })],
});

const loggerMiddleware = (req, res, next) => {
  //1. log request body
  if (req.url.includes("login")) {
    const logData = `${req.url}-${JSON.stringify(req.body)}`;
    logger.info(logData);
  }
  next();
};

export default loggerMiddleware;
