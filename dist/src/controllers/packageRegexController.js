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
exports.postPackageByRegEx = void 0;
const controllerHelpers_1 = require("./controllerHelpers");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const postPackageByRegEx = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Handling /package/byRegEx request');
        // Verify the X-Authorization header for authentication and permission
        const authorizationHeader = Array.isArray(req.headers['x-authorization'])
            ? req.headers['x-authorization'][0] // Use the first element if it's an array
            : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
        if (!authorizationHeader) {
            console.error('Authentication token missing or invalid');
            return res.status(400).json({ error: 'Authentication token missing or invalid' });
        }
        console.log('Authentication token:', authorizationHeader);
        // Extract the regex from the request body
        const requestBody = req.body;
        if (!requestBody.RegEx) {
            console.error('Missing or invalid regex in the request body');
            return res.status(400).json({ error: 'Missing or invalid regex in the request body' });
        }
        console.log('Regex from request body:', requestBody.RegEx);
        // Use DynamoDB to scan for packages matching the regex
        const scanCommand = new client_dynamodb_1.ScanCommand({
            TableName: 'packages',
        });
        console.log('Executing DynamoDB scan');
        const scanResult = yield controllerHelpers_1.dbclient.send(scanCommand);
        console.log('DynamoDB scan result:', scanResult);
        // Convert DynamoDB items to PackageMetadata
        const packageHistory = (scanResult.Items || []).map((item) => {
            const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
            const valueObject = unmarshalledItem.value || {};
            return {
                ID: valueObject.ID,
                Name: unmarshalledItem.name,
                Version: unmarshalledItem.version,
            };
        });
        console.log('Converted DynamoDB items:', packageHistory);
        // Perform additional regex filtering on the client side
        const regexFilteredPackages = packageHistory.filter((pkg) => new RegExp(requestBody.RegEx).test(pkg.Name));
        console.log('Packages after regex filtering:', regexFilteredPackages);
        if (regexFilteredPackages.length === 0) {
            console.warn('No packages found under this regex');
            return res.status(404).json({ error: 'No package found under this regex' });
        }
        console.log('Returning packages:', regexFilteredPackages);
        // Respond with the package history entries
        res.status(200).json(regexFilteredPackages);
    }
    catch (error) {
        console.error('Error handling /package/byRegEx:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.postPackageByRegEx = postPackageByRegEx;
