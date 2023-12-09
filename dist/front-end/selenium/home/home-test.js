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
exports.homeTest = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const setup_1 = require("../setup");
// Function to test the home page
function homeTest(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Log that the test is starting
            (0, setup_1.logToFile)('Starting homeTest...');
            yield driver.get('http://localhost:4200/home');
            // Check if the home page title is correct
            const title = yield driver.getTitle();
            if (title === 'FrontEnd') {
                // Title is correct
                (0, setup_1.logToFile)(`SUCCESS Home page title: ${title}`);
            }
            else {
                // Title is incorrect
                (0, setup_1.logToFile)(`ERROR Home page title: ${title}`);
                throw new Error('home page title is incorrect');
            }
            // Check if packages div is present
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('app-packages')), 5000);
            // Check if reset div is present
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('app-reset')), 5000);
            // Check if package div is present
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('app-package')), 5000);
            // Check if packageby-name div is present
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('app-packageby-name')), 5000);
            // Check if packageby-regex div is present
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('app-packageby-regex')), 5000);
            // Reset button test complete
            (0, setup_1.logToFile)('SUCCESS homeTest completed.\n');
        }
        catch (error) {
            // Log any errors that occur during the test
            (0, setup_1.logToFile)(`ERROR during homeTest: ${error}\n`);
        }
    });
}
exports.homeTest = homeTest;
