"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
require("dotenv/config"); // loads .env file into process.env. NOTE: this should be the first line
const tslog_1 = require("tslog");
const fs_1 = require("fs");
exports.log = new tslog_1.Logger({
    name: "Logger",
    minLevel: 7,
}); // no messages by default
if (process.env.LOG_LEVEL === "1") {
    // only log.info, log.warn, log.error, and log.fatal
    exports.log.settings.minLevel = 3;
}
else if (process.env.LOG_LEVEL === "2") {
    // all logs
    exports.log.settings.minLevel = 0;
}
// Set output file
exports.log.attachTransport((logObj) => {
    // Must have a LOG_FILE environment variable set
    if (process.env.LOG_FILE === undefined) {
        console.error("LOG_FILE environment variable not set");
        process.exit(1);
    }
    (0, fs_1.appendFileSync)(process.env.LOG_FILE, JSON.stringify(logObj) + "\n");
    // Log to file in format: [2021-03-31T21:00:00.000Z] [INFO] Logger: Hello World
    // appendFileSync(
    // 	process.env.LOG_FILE,
    // 	`[${logObj.date.toISOString()}] [${logObj.logLevel.toUpperCase()}] ${logObj.name}: ${logObj.argumentsArray.join(
    // 		" "
    // 	)}\n`
    // );
});
