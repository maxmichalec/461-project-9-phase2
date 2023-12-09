"use strict";
/*
 * File: packagesController.ts
 * Author: Madi Arnold
 * Description: The /packages endpoint logic
 */
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
exports.getPackages = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" });
// Controller function for handling the POST request to /packages
const getPackages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('POST /packages endpoint');
        // Validate request body
        const packageQueries = req.body;
        if (!packageQueries || packageQueries.length === 0) {
            return res.status(400).json({ error: 'PackageQuery array must not be empty.' });
        }
        // Verify the X-Authorization header for authentication and permission
        const authToken = Array.isArray(req.headers['x-authorization'])
            ? req.headers['x-authorization'][0] // Use the first element if it's an array
            : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
        if (!authToken || !isValidAuthToken(authToken)) {
            return res.status(400).json({ error: 'Invalid or missing authentication token.' });
        }
        // Parse query parameters safely
        let offset;
        if (req.query.offset) {
            const rawOffset = req.query.offset;
            // Check if rawOffset is a valid number
            if (!isNaN(parseInt(rawOffset, 10))) {
                offset = rawOffset;
            }
            else {
                return res.status(400).json({ error: 'Invalid offset value.' });
            }
        }
        res.header('offset', offset === null || offset === void 0 ? void 0 : offset.toString());
        const results = yield Promise.all(packageQueries.map(({ Name, Version }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!Name) {
                return res.status(400).json({ error: 'PackageQuery must have a Name field.' });
            }
            if (Name === '*') {
                // Handle the case where Name is "*"
                const allPackagesResult = yield dynamoDb.send(new client_dynamodb_1.ScanCommand({
                    TableName: 'packages',
                    // Any additional conditions or parameters as needed
                    ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                }));
                // Convert DynamoDB items to PackageMetadata
                const allPackages = allPackagesResult.Items
                    ? allPackagesResult.Items.map((item) => {
                        const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                        // const valueObject = unmarshalledItem.value || {};
                        return {
                            ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                            Name: unmarshalledItem.name,
                            Version: unmarshalledItem.version,
                        };
                    })
                    : [];
                console.log('All Packages:', allPackages);
                return allPackages;
            }
            else {
                // Handle the case where Name is not "*"
                let filteredPackages = [];
                if (!Version) {
                    const params = {
                        TableName: 'packages',
                        FilterExpression: '#n = :name' + (Version ? ' AND #v = :version' : ''),
                        ExpressionAttributeNames: Object.assign({ '#n': 'name' }, (Version ? { '#v': 'version' } : {})),
                        ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(Object.assign({ ':name': Name }, (Version ? { ':version': Version } : {}))),
                        ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                    };
                    const result = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(params));
                    // Convert DynamoDB items to PackageMetadata
                    console.log('Result', result);
                    filteredPackages = result.Items
                        ? result.Items.map((item) => {
                            const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                            // const valueObject = unmarshalledItem.value || {};
                            return {
                                ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                                Name: unmarshalledItem.name,
                                Version: unmarshalledItem.version,
                            };
                        })
                        : [];
                }
                else {
                    const exactMatch = /^(\d+\.\d+\.\d+)$/.exec(Version);
                    const boundedRange = /^(\d+\.\d+\.\d+)-(\d+\.\d+\.\d+)$/.exec(Version);
                    const caratRange = /^\^(\d+\.\d+\.\d+)$/.exec(Version);
                    const tildeRange = /^~(\d+\.\d+\.(\d+))$/.exec(Version);
                    if (exactMatch) {
                        const params = {
                            TableName: 'packages',
                            FilterExpression: '#n = :name' + (Version ? ' AND #v = :version' : ''),
                            ExpressionAttributeNames: Object.assign({ '#n': 'name' }, (Version ? { '#v': 'version' } : {})),
                            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(Object.assign({ ':name': Name }, (Version ? { ':version': Version } : {}))),
                            ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                        };
                        const result = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(params));
                        // Convert DynamoDB items to PackageMetadata
                        console.log('Result', result);
                        filteredPackages = result.Items
                            ? result.Items.map((item) => {
                                const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                                // const valueObject = unmarshalledItem.value || {};
                                return {
                                    ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                                    Name: unmarshalledItem.name,
                                    Version: unmarshalledItem.version,
                                };
                            })
                            : [];
                    }
                    else if (boundedRange) {
                        const params = {
                            TableName: 'packages',
                            FilterExpression: '#n = :name' + (Version ? ' AND #v BETWEEN :startVersion AND :endVersion' : ''),
                            ExpressionAttributeNames: Object.assign({ '#n': 'name' }, (Version ? { '#v': 'version' } : {})),
                            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(Object.assign({ ':name': Name }, (Version ? { ':startVersion': boundedRange[1], ':endVersion': boundedRange[2] } : {}))),
                            ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                        };
                        const result = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(params));
                        // Convert DynamoDB items to PackageMetadata
                        console.log('Result', result);
                        filteredPackages = result.Items
                            ? result.Items.map((item) => {
                                const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                                // const valueObject = unmarshalledItem.value || {};
                                return {
                                    ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                                    Name: unmarshalledItem.name,
                                    Version: unmarshalledItem.version,
                                };
                            })
                            : [];
                    }
                    else if (caratRange) {
                        const caretMatch = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(Version);
                        const [major, minor, patch] = (caretMatch || []).slice(1).map(Number);
                        const startVersion = `${major}.${minor}.${patch}`;
                        const endVersion = `${major + 1}.0.0`;
                        const params = {
                            TableName: 'packages',
                            FilterExpression: '#n = :name' + (Version ? ' AND #v >= :startVersion AND #v < :endVersion' : ''),
                            ExpressionAttributeNames: Object.assign({ '#n': 'name' }, (Version ? { '#v': 'version' } : {})),
                            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(Object.assign({ ':name': Name }, (Version ? { ':startVersion': startVersion, ':endVersion': endVersion } : {}))),
                            ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                        };
                        const result = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(params));
                        // Convert DynamoDB items to PackageMetadata
                        console.log('Result', result);
                        filteredPackages = result.Items
                            ? result.Items.map((item) => {
                                const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                                // const valueObject = unmarshalledItem.value || {};
                                return {
                                    ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                                    Name: unmarshalledItem.name,
                                    Version: unmarshalledItem.version,
                                };
                            })
                            : [];
                    }
                    else if (tildeRange) {
                        const tildeMatch = /^\~(\d+)\.(\d+)\.(\d+)$/.exec(Version);
                        const [major, minor, patch] = (tildeMatch || []).slice(1).map(Number);
                        const startVersion = `${major}.${minor}.${patch}`;
                        const endVersion = `${major}.${(minor + 1)}.0`;
                        const params = {
                            TableName: 'packages',
                            FilterExpression: '#n = :name' + (Version ? ' AND #v >= :startVersion AND #v < :endVersion' : ''),
                            ExpressionAttributeNames: Object.assign({ '#n': 'name' }, (Version ? { '#v': 'version' } : {})),
                            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(Object.assign({ ':name': Name }, (Version ? { ':startVersion': startVersion, ':endVersion': endVersion } : {}))),
                            ExclusiveStartKey: offset ? (0, util_dynamodb_1.unmarshall)(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
                        };
                        const result = yield dynamoDb.send(new client_dynamodb_1.ScanCommand(params));
                        // Convert DynamoDB items to PackageMetadata
                        console.log('Result', result);
                        filteredPackages = result.Items
                            ? result.Items.map((item) => {
                                const unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                                // const valueObject = unmarshalledItem.value || {};
                                return {
                                    ID: (unmarshalledItem === null || unmarshalledItem === void 0 ? void 0 : unmarshalledItem.id.toString()) || "",
                                    Name: unmarshalledItem.name,
                                    Version: unmarshalledItem.version,
                                };
                            })
                            : [];
                    }
                    else {
                        res.status(400).json({ error: 'Incorrect Version Format' });
                    }
                }
                console.log('Filtered Packages:', filteredPackages);
                return filteredPackages;
            }
        })));
        // Flatten the array of arrays into a single array
        const allPackages = results.flat();
        res.status(200).json(allPackages); // Send a JSON response with the filtered packages
    }
    catch (error) {
        console.error('Error handling /packages:', error);
        res.status(413).json({ error: 'Internal Server Error' }); // Handle any errors with a 500 status
    }
});
exports.getPackages = getPackages;
// Example function to validate the authentication token (replace with your logic)
function isValidAuthToken(token) {
    // Add your authentication token validation logic here
    // For simplicity, this example assumes any non-empty token is valid
    return !!token;
}
