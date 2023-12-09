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
exports.packageByRegexTest = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const setup_1 = require("../setup");
// Function to test fetching a package
function packageByRegexTest(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Log that the test is starting
            (0, setup_1.logToFile)('Starting packageByRegexTest...');
            yield driver.get('http://localhost:4200/home');
            // Locate the input fields and enter package name and version
            const packageRegexInput = yield driver.findElement(selenium_webdriver_1.By.id('regexInput'));
            yield packageRegexInput.sendKeys('*'); // Fetch all packages
            // Locate and click the "Search Packages" button
            const searchPackagesButton = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.package-search-container button')), 5000);
            yield searchPackagesButton.click();
            // Wait for the output or changes caused by clicking the button
            const searchResponse = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.package-list')), 5000);
            const isVisible = yield searchResponse.isDisplayed();
            // TODO: Update this to check for the correct results
            if (isVisible) {
                const message = yield searchResponse.getText();
                (0, setup_1.logToFile)(`SUCCESS Search button message: ${message}`);
            }
            else {
                throw new Error('packages not visible');
            }
            // Wait for a moment to see the result
            yield driver.sleep(3000);
            // Log that the test is complete
            (0, setup_1.logToFile)('SUCCESS packageByRegexTest completed.\n');
        }
        catch (error) {
            // Log any errors that occur during the test
            (0, setup_1.logToFile)(`ERROR during packageByRegexTest: ${error}\n`);
        }
    });
}
exports.packageByRegexTest = packageByRegexTest;
