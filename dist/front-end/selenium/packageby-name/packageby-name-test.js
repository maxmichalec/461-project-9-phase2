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
exports.packageByNameTest = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const setup_1 = require("../setup");
// Function to test fetching a package
function packageByNameTest(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Log that the test is starting
            (0, setup_1.logToFile)('Starting packageByNameTest...');
            yield driver.get('http://localhost:4200/home');
            // Locate the input fields and enter package name and version
            const packageNameInput = yield driver.findElement(selenium_webdriver_1.By.css('.package-by-name-container input'));
            yield packageNameInput.sendKeys('*'); // Fetch all packages
            // Locate and click the history button
            const historyButton = yield driver.findElement(selenium_webdriver_1.By.id('historyButton'));
            yield historyButton.click();
            // Wait for the output or changes caused by clicking the button
            const historyResponse = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.history-entry')), 5000);
            const isVisible = yield historyResponse.isDisplayed();
            // TODO: Update this to check for the correct results
            if (isVisible) {
                const message = yield historyResponse.getText();
                (0, setup_1.logToFile)(`SUCCESS Package history button message: ${message}`);
            }
            else {
                throw new Error('packages not visible');
            }
            // Locate and click the delete button
            const deleteButton = yield driver.findElement(selenium_webdriver_1.By.id('deleteByNameButton'));
            yield deleteButton.click();
            // Wait for the output or changes caused by clicking the button
            const deleteResponse = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.message')), 5000);
            const isVisibleDelete = yield deleteResponse.isDisplayed();
            // TODO: Update this to check for the correct results
            if (isVisibleDelete) {
                const deleteMessage = yield deleteResponse.getText();
                if (deleteMessage === 'Package deletion unsuccessful') {
                    throw new Error('deletion failed');
                }
                else {
                    (0, setup_1.logToFile)(`SUCCESS Package deletion button message: ${deleteMessage}`);
                }
            }
            else {
                throw new Error('no response');
            }
            // Wait for a moment to see the result
            yield driver.sleep(3000);
            // Log that the test is complete
            (0, setup_1.logToFile)('SUCCESS packageByNameTest completed.\n');
        }
        catch (error) {
            // Log any errors that occur during the test
            (0, setup_1.logToFile)(`ERROR during packageByNameTest: ${error}\n`);
        }
    });
}
exports.packageByNameTest = packageByNameTest;
