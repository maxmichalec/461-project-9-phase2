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
exports.deletePackageByName = exports.getPackageHistoryByName = void 0;
const logger_1 = require("../logger");
const controllerHelpers_1 = require("./controllerHelpers");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
// Controller function for handling the GET request to /package/byName/{name}
function getPackageHistoryByName(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verify the X-Authorization header for authentication and permission
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check for permission to access the package history (you can add more logic here)
            // Retrieve the package history entries based on the provided package name
            const packageName = (_a = req.params) === null || _a === void 0 ? void 0 : _a.name;
            if (!packageName) {
                return res.status(400).json({ error: 'Package name missing or invalid' });
            }
            // Fetch entry from packageHistory DB table
            logger_1.log.debug("Fetching package history for:", packageName);
            const params = {
                TableName: "packageHistory",
                Key: {
                    name: { S: packageName },
                },
            };
            const packageHistory = [];
            yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.GetItemCommand(params))
                .then((response) => {
                if (response.Item) {
                    logger_1.log.info("Found package history for:", packageName);
                    if (response.Item.history.L) {
                        logger_1.log.info("Found", response.Item.history.L.length, "package history entries for:", packageName);
                        response.Item.history.L.forEach((item) => {
                            if (item.S) {
                                const itemAsJSON = JSON.parse(item.S);
                                const entry = {
                                    Action: itemAsJSON.Action,
                                    Date: itemAsJSON.Date,
                                    PackageMetadata: itemAsJSON.PackageMetadata,
                                    User: itemAsJSON.User,
                                };
                                packageHistory.push(entry);
                            }
                        });
                    }
                }
            })
                .catch((error) => {
                logger_1.log.error("Error fetching package history from DB:", error);
            });
            if (packageHistory.length === 0) {
                return res.status(404).json({ error: 'Package not found' });
            }
            // Respond with the package history entries
            res.status(200).json(packageHistory);
        }
        catch (error) {
            console.error('Error handling /package/byName/{name}:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.getPackageHistoryByName = getPackageHistoryByName;
// Controller function for handling the DELETE request to /package/byName/{name}
function deletePackageByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verify the X-Authorization header for authentication and permission
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check for permission to delete the package (you can add more logic here)
            // Retrieve the package name from the request path
            const packageName = req.params.name;
            // Search database for package with matching name and delete entry and S3 content
            const params = {
                TableName: 'packages',
                FilterExpression: '#attrName = :value',
                ExpressionAttributeNames: {
                    '#attrName': 'name',
                },
                ExpressionAttributeValues: {
                    ':value': { S: packageName },
                },
            };
            logger_1.log.info("Scanning DB for items with name:", packageName);
            const scanResult = yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.ScanCommand(params));
            if (scanResult.Items && scanResult.Items.length > 0) {
                logger_1.log.info("Found", scanResult.Items.length, "items with name:", packageName);
                // Delete DB entries
                const dbdeletePromises = scanResult.Items.map((item) => {
                    const deleteParams = {
                        TableName: 'packages',
                        Key: {
                            id: item.id,
                        },
                    };
                    const deleteCommand = new client_dynamodb_1.DeleteItemCommand(deleteParams);
                    return controllerHelpers_1.dbclient.send(deleteCommand);
                });
                // Delete S3 content
                const s3deletePromises = scanResult.Items.map((item) => {
                    logger_1.log.info("Deleting S3 content for id:", item.id.N);
                    const deleteParams = {
                        Bucket: 'pckstore',
                        Key: "packages/" + item.id.N + ".zip",
                    };
                    return controllerHelpers_1.s3client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
                });
                yield Promise.all(dbdeletePromises);
                yield Promise.all(s3deletePromises);
            }
            else {
                return res.status(404).json({ error: 'Package not found' });
            }
            // Delete package history entry
            const deleteParams = {
                TableName: 'packageHistory',
                Key: {
                    name: { S: packageName },
                },
            };
            yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.DeleteItemCommand(deleteParams))
                .then(() => {
                logger_1.log.info("Deleted package history for:", packageName);
            })
                .catch((error) => {
                logger_1.log.error("Error deleting package history from DB:", error);
            });
            // Respond with a success message
            res.status(200).json({ message: 'Package is deleted' });
        }
        catch (error) {
            console.error('Error handling /package/byName/{name}:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.deletePackageByName = deletePackageByName;
