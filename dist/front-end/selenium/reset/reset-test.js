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
exports.resetTest = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const setup_1 = require("../setup");
// Function to test the Reset button
function resetTest(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Log that the test is starting
            (0, setup_1.logToFile)('Starting resetTest...');
            yield driver.get('http://localhost:4200/home');
            // Wait for the reset button to be present (timeout is 5 seconds)
            const resetButton = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.reset-container button')), 5000);
            // Click the reset button
            yield resetButton.click();
            // Wait for the output or changes caused by clicking the button
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.reset-message')), 5000);
            // Check reset button output
            const resetResponse = yield driver.findElement(selenium_webdriver_1.By.css('.reset-message'));
            const isVisible = yield resetResponse.isDisplayed();
            if (isVisible) {
                const message = yield resetResponse.getText();
                if (message === 'Error reseting application.') {
                    // Reset failed
                    throw new Error('reset failed');
                }
                else if (message === 'Application reset successful.') {
                    // Reset successful
                    (0, setup_1.logToFile)(`SUCCESS Reset button message: ${message}`);
                }
            }
            else {
                throw new Error('reset message not visible');
            }
            // Reset button test complete
            (0, setup_1.logToFile)('SUCCESS resetTest completed.\n');
        }
        catch (error) {
            // Log any errors that occur during the test
            (0, setup_1.logToFile)(`ERROR during resetTest: ${error}\n`);
        }
    });
}
exports.resetTest = resetTest;
