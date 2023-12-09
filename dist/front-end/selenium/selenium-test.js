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
// selenium-test.ts
const setup_1 = require("./setup");
const home_test_1 = require("./home/home-test");
const reset_test_1 = require("./reset/reset-test");
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = yield (0, setup_1.setup)();
        try {
            yield (0, home_test_1.homeTest)(driver); // Home page test
            // await fetchPackagesTest(driver); // Fetch packages test
            yield (0, reset_test_1.resetTest)(driver); // Reset button test
            // await packageByNameTest(driver); // Package by name test
            // await packageByRegexTest(driver); // Package by regex test
        }
        finally {
            yield driver.quit();
        }
    });
}
runTests();
