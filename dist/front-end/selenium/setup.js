"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = exports.logToFile = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const config_1 = require("./config");
// Function to log messages to a file
function logToFile(message) {
    config_1.fs.appendFileSync(config_1.logFilePath, `${new Date().toISOString()} - ${message}\n`);
}
exports.logToFile = logToFile;
// Setup driver to use Chrome
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        logToFile(`Starting setup()...`);
        const driver = yield new selenium_webdriver_1.Builder().forBrowser('chrome').build();
        yield driver.get(config_1.baseUrl);
        logToFile(`SUCCESS setup() complete. Navigated to ${config_1.baseUrl}\n`);
        return driver;
    });
}
exports.setup = setup;
