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
exports.fetchPackagesTest = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const setup_1 = require("../setup");
// Function to test fetching a package
function fetchPackagesTest(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Log that the test is starting
            (0, setup_1.logToFile)('Starting fetchPackageTest...');
            yield driver.get('http://localhost:4200/home');
            // Locate the input fields and enter package name and version
            const packageNameInput = yield driver.findElement(selenium_webdriver_1.By.id('packageName'));
            yield packageNameInput.sendKeys('*'); // Fetch all packages
            const packageVersionInput = yield driver.findElement(selenium_webdriver_1.By.id('packageVersion'));
            yield packageVersionInput.sendKeys(''); // Leave blank to fetch all versions
            // Locate and click the "Fetch Packages" button
            const fetchPackagesButton = yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('fetchButton')), 5000);
            yield fetchPackagesButton.click();
            // Wait for the output or changes caused by clicking the button
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.package-list-container')), 5000);
            // Check fetch button output
            const fetchResponse = yield driver.findElement(selenium_webdriver_1.By.css('.reset-message'));
            const isVisible = yield fetchResponse.isDisplayed();
            // TODO: Update this to check for the correct results
            if (isVisible) {
                const message = yield fetchResponse.getText();
                (0, setup_1.logToFile)(`SUCCESS Fetch button message: ${message}`);
            }
            else {
                throw new Error('packages not visible');
            }
            // Wait for a moment to see the result
            yield driver.sleep(3000);
            // Log that the test is complete
            (0, setup_1.logToFile)('SUCCESS fetchPackageTest completed.\n');
        }
        catch (error) {
            // Log any errors that occur during the test
            (0, setup_1.logToFile)(`ERROR during fetchPackageTest: ${error}\n`);
        }
    });
}
exports.fetchPackagesTest = fetchPackagesTest;
