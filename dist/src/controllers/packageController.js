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
exports.createPackage = exports.deletePackage = exports.updatePackage = exports.getPackageById = void 0;
const logger_1 = require("../logger");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const controllerHelpers_1 = require("./controllerHelpers");
const AdmZip = require("adm-zip");
// Controller function for handling the GET request to /package/{id}
function getPackageById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packageId = req.params.id; // Extract the package ID from the URL
            let packageName = "";
            let packageVersion = "";
            // Verify the X-Authorization header for authentication and permission
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check for permission to retrieve the package (you can add more logic here)
            // Check if id is defined
            if (!packageId) {
                return res.status(400).json({ error: 'Missing package ID' });
            }
            // Retrieve the package with the specified ID from your data source (e.g., a database)
            const params = {
                TableName: "packages",
                Key: {
                    id: { N: packageId },
                },
            };
            let package1 = undefined;
            const command = new client_dynamodb_1.GetItemCommand(params);
            yield controllerHelpers_1.dbclient.send(command)
                .then((response) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                logger_1.log.info("GetItem succeeded:", response.$metadata);
                if (response.Item) {
                    package1 = {
                        metadata: {
                            "Name": ((_b = (_a = response.Item) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.S) || "",
                            "Version": ((_d = (_c = response.Item) === null || _c === void 0 ? void 0 : _c.version) === null || _d === void 0 ? void 0 : _d.S) || "",
                            "ID": packageId
                        },
                        data: {
                            "Content": "",
                            "JSProgram": "",
                        }
                    };
                    packageName = ((_f = (_e = response.Item) === null || _e === void 0 ? void 0 : _e.name) === null || _f === void 0 ? void 0 : _f.S) || "";
                    packageVersion = ((_h = (_g = response.Item) === null || _g === void 0 ? void 0 : _g.version) === null || _h === void 0 ? void 0 : _h.S) || "";
                }
            })
                .catch((error) => {
                logger_1.log.error("Error getting item:", error);
            });
            if (!package1) {
                return res.status(404).json({ error: 'Package not found' });
            }
            // Get package content from S3 bucket
            let content = undefined;
            const s3params = {
                Bucket: "pckstore",
                Key: "packages/" + packageId + ".zip",
            };
            yield controllerHelpers_1.s3client.send(new client_s3_1.GetObjectCommand(s3params))
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                logger_1.log.info("GetObject succeeded, downloaded from S3:", response.$metadata);
                yield ((_a = response.Body) === null || _a === void 0 ? void 0 : _a.transformToString('base64').then((arrayBuffer) => {
                    content = arrayBuffer;
                    package1.data.Content = content;
                }));
                logger_1.log.info("Received content");
            }))
                .catch((error) => {
                logger_1.log.error("Error downloading object from S3:", error);
            });
            if (content == null) {
                return res.status(404).json({ error: 'Package content not found' });
            }
            // Append new history entry to current history
            const date = new Date();
            const isoDate = date.toISOString();
            // Package metadata
            const metadata = {
                ID: packageId,
                Name: packageName,
                Version: packageVersion,
            };
            // Create package history entry
            const history = {
                Action: "DOWNLOAD",
                Date: isoDate,
                PackageMetadata: metadata,
                User: controllerHelpers_1.defaultUser,
            };
            // Append to current history
            const appendHistoryParams = {
                TableName: "packageHistory",
                Key: {
                    name: { S: packageName },
                },
                UpdateExpression: `SET #attrName = list_append(if_not_exists(#attrName, :empty_list), :newData)`,
                ExpressionAttributeNames: {
                    '#attrName': "history",
                },
                ExpressionAttributeValues: {
                    ':empty_list': { L: [] },
                    ':newData': { L: [{ S: JSON.stringify(history) }] },
                },
            };
            yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.UpdateItemCommand(appendHistoryParams))
                .then(() => {
                logger_1.log.info("Successfully appended history entry to package:", packageName);
            })
                .catch((error) => {
                logger_1.log.error("Error appending history entry to package:", packageName, error);
            });
            // Respond with the retrieved package
            res.status(200).json(package1);
        }
        catch (error) {
            logger_1.log.error('Error handling GET /package/{id}:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.getPackageById = getPackageById;
// Controller function for handling the PUT request to update a package by ID
function updatePackage(req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packageId = req.body.metadata.ID; // Extract the package ID from the URL
            const packageName = req.body.metadata.Name;
            const packageVersion = req.body.metadata.Version;
            logger_1.log.info(`updatePackage request id: ${packageId}, name: ${packageName}, version: ${packageVersion}`);
            // Verify the X-Authorization header for authentication and permission
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check if id, name, and version are defined
            if (!packageId || !packageName || !packageVersion) {
                return res.status(400).json({ error: 'Missing package ID, name, or version' });
            }
            // Check if name and version match id
            if ((0, controllerHelpers_1.generatePackageId)(packageName, packageVersion) !== packageId) {
                return res.status(400).json({ error: 'Package name and version do not match package ID' });
            }
            // Get the Package from the request body
            const updatedPackageData = req.body.data;
            // Validate request body for the package data (replace with your own validation logic)
            // Check if the package with the given ID exists
            const params = {
                TableName: "packages",
                Key: {
                    id: { N: packageId },
                },
            };
            let exists = false;
            const command = new client_dynamodb_1.GetItemCommand(params);
            yield controllerHelpers_1.dbclient.send(command)
                .then((response) => {
                logger_1.log.info("GetItem succeeded:", response.$metadata);
                if (response.Item) {
                    exists = true;
                }
            })
                .catch((error) => {
                logger_1.log.error("Error getting item:", error);
                throw (error);
            });
            if (!exists) {
                return res.status(404).json({ error: 'Package does not already exist' });
            }
            // Update the package data in S3 bucket + database metadata
            // Verify that only one of Content or URL is set and then update package info if valid
            let info;
            if (!((updatedPackageData.Content == '') !== (updatedPackageData.URL == ''))) {
                return res.status(400).json({ error: 'Invalid package update request: Bad set of Content and URL' });
            }
            else if (updatedPackageData === null || updatedPackageData === void 0 ? void 0 : updatedPackageData.Content) {
                logger_1.log.info("updatePackage request via zip upload");
                const zipBuffer = Buffer.from(atob(updatedPackageData.Content.split(",")[1]), 'binary');
                // Extract package.json from zip file
                const zip = new AdmZip(zipBuffer);
                const zipEntries = zip.getEntries();
                let packageJson = null;
                let packageJsonContent;
                zipEntries.forEach(entry => {
                    const entryPathParts = entry.entryName.split('/');
                    if (entryPathParts.length === 2 && entryPathParts[1] === 'package.json') {
                        packageJson = entry.getData().toString('utf8');
                    }
                });
                if (packageJson == null) {
                    return res.status(400).json({ error: 'Invalid package update request: No package.json found in zip' });
                }
                else {
                    packageJsonContent = JSON.parse(packageJson);
                    logger_1.log.info("repo url:", (_a = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _a === void 0 ? void 0 : _a.url, "name:", packageJsonContent.name, "version:", packageJsonContent.version);
                    // Check for repository url, name, and version in package.json
                    if (!((_b = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _b === void 0 ? void 0 : _b.url) || !packageJsonContent.name || !packageJsonContent.version) {
                        return res.status(400).json({ error: 'Invalid package update request: package.json must contain repository url, package name, and version' });
                    }
                }
                // Update package info (no need to rate uploaded package at this point)
                info = {
                    ID: packageId,
                    NAME: packageJsonContent.name,
                    OWNER: "",
                    VERSION: packageJsonContent.version,
                    URL: (_c = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _c === void 0 ? void 0 : _c.url,
                    NET_SCORE: 0,
                    RAMP_UP_SCORE: 0,
                    CORRECTNESS_SCORE: 0,
                    BUS_FACTOR_SCORE: 0,
                    RESPONSIVE_MAINTAINER_SCORE: 0,
                    LICENSE_SCORE: 0,
                    PULL_REQUESTS_SCORE: 0,
                    PINNED_DEPENDENCIES_SCORE: 0,
                };
                // Upload package content to S3 bucket and make reference in database
                const s3params = {
                    Bucket: "pckstore",
                    Key: "packages/" + packageId + ".zip",
                    Body: zipBuffer,
                };
                yield controllerHelpers_1.s3client.send(new client_s3_1.PutObjectCommand(s3params))
                    .then((response) => {
                    logger_1.log.info("PutObject succeeded, uploaded to S3:", response.$metadata);
                })
                    .catch((error) => {
                    logger_1.log.error("Error storing object to S3:", error);
                    throw (error);
                });
            }
            else if (updatedPackageData === null || updatedPackageData === void 0 ? void 0 : updatedPackageData.URL) {
                logger_1.log.info("updatePackage request via public ingest:", updatedPackageData.URL);
                info = yield (0, controllerHelpers_1.metricCalcFromUrl)(updatedPackageData.URL);
                logger_1.log.info("ingest via URL info:", info);
                if (info == null) {
                    return res.status(400).json({ error: 'Invalid package update request: Could not get GitHub url' });
                }
                else if (info.NET_SCORE < 0.5) {
                    return res.status(424).json({ error: 'Invalid package update request: Package can not be uploaded due to disqualifying rating.' });
                }
                info.ID = packageId;
                // Download package content from GitHub using info
                const response = yield fetch(`https://api.github.com/repos/${info.OWNER}/${info.NAME}/zipball/main`, {
                    headers: {
                        Authorization: process.env.GITHUB_TOKEN || "",
                        Accept: 'application/vnd.github.v3+json',
                    },
                });
                if (!response.ok) {
                    return res.status(400).json({ error: 'Invalid package update request: Could not get GitHub url' });
                }
                const zipBuffer = Buffer.from(yield response.arrayBuffer());
                // Upload package content to S3 bucket and make reference in database
                const s3params = {
                    Bucket: "pckstore",
                    Key: "packages/" + packageId + ".zip",
                    Body: zipBuffer,
                };
                yield controllerHelpers_1.s3client.send(new client_s3_1.PutObjectCommand(s3params))
                    .then((response) => {
                    logger_1.log.info("PutObject succeeded, uploaded to S3:", response.$metadata);
                })
                    .catch((error) => {
                    logger_1.log.error("Error storing object to S3:", error);
                    throw (error);
                });
            }
            else {
                return res.status(400).json({ error: 'Invalid package update request: Bad set of Content and URL' });
            }
            // Append new history entry to current history
            const date = new Date();
            const isoDate = date.toISOString();
            // Package metadata
            const metadata = {
                ID: packageId,
                Name: packageName,
                Version: packageVersion,
            };
            // Create package history entry
            const history = {
                Action: "UPDATE",
                Date: isoDate,
                PackageMetadata: metadata,
                User: controllerHelpers_1.defaultUser,
            };
            // Append to current history
            const appendHistoryParams = {
                TableName: "packageHistory",
                Key: {
                    name: { S: packageName },
                },
                UpdateExpression: `SET #attrName = list_append(if_not_exists(#attrName, :empty_list), :newData)`,
                ExpressionAttributeNames: {
                    '#attrName': "history",
                },
                ExpressionAttributeValues: {
                    ':empty_list': { L: [] },
                    ':newData': { L: [{ S: JSON.stringify(history) }] },
                },
            };
            yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.UpdateItemCommand(appendHistoryParams))
                .then(() => {
                logger_1.log.info("Successfully appended history entry to package:", packageName);
            })
                .catch((error) => {
                logger_1.log.error("Error appending history entry to package:", packageName, error);
            });
            // Respond with a success message
            res.status(200).json({ message: 'Package updated successfully' });
        }
        catch (error) {
            logger_1.log.error('Error handling PUT /package/:id:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.updatePackage = updatePackage;
// Controller function for handling the DELETE request to /package/:id
function deletePackage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packageId = req.params.id; // Extract the package ID from the URL
            // Verify the X-Authorization header for authentication and permission
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check for permission to delete the package (you can add more logic here)
            // Perform the package deletion
            const params = {
                TableName: "packages",
                Key: {
                    id: { N: packageId },
                },
            };
            const command = new client_dynamodb_1.DeleteItemCommand(params);
            yield controllerHelpers_1.dbclient.send(command)
                .then((response) => {
                logger_1.log.info("GetItem succeeded:", response.$metadata);
            })
                .catch((error) => {
                logger_1.log.error("Error getting item:", error);
                throw (error);
            });
            // Delete from S3 bucket
            const s3params = {
                Bucket: "pckstore",
                Key: "packages/" + packageId + ".zip",
            };
            yield controllerHelpers_1.s3client.send(new client_s3_1.DeleteObjectCommand(s3params))
                .then((response) => {
                logger_1.log.info("DeleteObject succeeded, deleted from S3:", response.$metadata);
            })
                .catch((error) => {
                logger_1.log.error("Error deleting object from S3:", error);
            });
            // TODO: Delete version from package history?
            // Respond with a success message
            res.status(200).json({ message: 'Package is deleted' });
        }
        catch (error) {
            logger_1.log.error('Error handling DELETE /package/:id:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.deletePackage = deletePackage;
// Controller function for handling the POST request to /package
function createPackage(req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract the package data from the request body
            const packageData = req.body;
            let id, s3path = "";
            // Verify the X-Authorization header for authentication
            const authorizationHeader = Array.isArray(req.headers['x-authorization'])
                ? req.headers['x-authorization'][0] // Use the first element if it's an array
                : req.headers['x-authorization']; // Use the value directly if it's a string or undefined
            if (!authorizationHeader) {
                return res.status(400).json({ error: 'Authentication token missing or invalid' });
            }
            // Check for permission to create a package (you can add more logic here)
            // Check that package creation request is valid (only Content or URL is set)
            // If request is valid, rate package (valid if rating >= 0.5)
            let info;
            if (!((packageData.Content == '') !== (packageData.URL == ''))) {
                return res.status(400).json({ error: 'Invalid package creation request: Bad set of Content and URL' });
            }
            else if (packageData === null || packageData === void 0 ? void 0 : packageData.Content) {
                logger_1.log.info("createPackage request via zip upload");
                const zipBuffer = Buffer.from(atob(packageData.Content.split(",")[1]), 'binary');
                // Extract package.json from zip file
                const zip = new AdmZip(zipBuffer);
                const zipEntries = zip.getEntries();
                let packageJson = null;
                let packageJsonContent;
                zipEntries.forEach(entry => {
                    const entryPathParts = entry.entryName.split('/');
                    if (entryPathParts.length === 2 && entryPathParts[1] === 'package.json') {
                        packageJson = entry.getData().toString('utf8');
                    }
                });
                if (packageJson == null) {
                    return res.status(400).json({ error: 'Invalid package creation request: No package.json found in zip' });
                }
                else {
                    packageJsonContent = JSON.parse(packageJson);
                    logger_1.log.info("repo url:", (_a = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _a === void 0 ? void 0 : _a.url, "name:", packageJsonContent.name, "version:", packageJsonContent.version);
                    // Check for repository url, name, and version in package.json
                    if (!((_b = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _b === void 0 ? void 0 : _b.url) || !packageJsonContent.name || !packageJsonContent.version) {
                        return res.status(400).json({ error: 'Invalid package creation request: package.json must contain repository url, package name, and version' });
                    }
                }
                // If valid, generate package ID from name and version
                id = (0, controllerHelpers_1.generatePackageId)(packageJsonContent.name, packageJsonContent.version);
                // Update package info (no need to rate uploaded package at this point)
                info = {
                    ID: id,
                    NAME: packageJsonContent.name,
                    OWNER: "",
                    VERSION: packageJsonContent.version,
                    URL: (_c = packageJsonContent === null || packageJsonContent === void 0 ? void 0 : packageJsonContent.repository) === null || _c === void 0 ? void 0 : _c.url,
                    NET_SCORE: 0,
                    RAMP_UP_SCORE: 0,
                    CORRECTNESS_SCORE: 0,
                    BUS_FACTOR_SCORE: 0,
                    RESPONSIVE_MAINTAINER_SCORE: 0,
                    LICENSE_SCORE: 0,
                    PULL_REQUESTS_SCORE: 0,
                    PINNED_DEPENDENCIES_SCORE: 0,
                };
                // Upload package content to S3 bucket and make reference in database
                const s3params = {
                    Bucket: "pckstore",
                    Key: "packages/" + id + ".zip",
                    Body: zipBuffer,
                };
                yield controllerHelpers_1.s3client.send(new client_s3_1.PutObjectCommand(s3params))
                    .then((response) => {
                    logger_1.log.info("PutObject succeeded, uploaded to S3:", response.$metadata);
                })
                    .catch((error) => {
                    logger_1.log.error("Error storing object to S3:", error);
                    throw (error);
                });
            }
            else if (packageData === null || packageData === void 0 ? void 0 : packageData.URL) {
                logger_1.log.info("createPackage request via public ingest:", packageData.URL);
                info = yield (0, controllerHelpers_1.metricCalcFromUrl)(packageData.URL);
                logger_1.log.info("ingest via URL info:", info);
                if (info == null) {
                    return res.status(400).json({ error: 'Invalid package creation request: Could not get GitHub url' });
                }
                else if (info.NET_SCORE < 0.5) {
                    return res.status(424).json({ error: 'Invalid package creation request: Package can not be uploaded due to disqualifying rating.' });
                }
                // If valid, generate package ID from name and version
                id = (0, controllerHelpers_1.generatePackageId)(info.NAME, info.VERSION);
                info.ID = id;
                // Download package content from GitHub using info
                const response = yield fetch(`https://api.github.com/repos/${info.OWNER}/${info.NAME}/zipball/main`, {
                    headers: {
                        Authorization: process.env.GITHUB_TOKEN || "",
                        Accept: 'application/vnd.github.v3+json',
                    },
                });
                if (!response.ok) {
                    return res.status(400).json({ error: 'Invalid package creation request: Could not get GitHub url' });
                }
                const zipBuffer = Buffer.from(yield response.arrayBuffer());
                // Upload package content to S3 bucket and make reference in database
                const s3params = {
                    Bucket: "pckstore",
                    Key: "packages/" + id + ".zip",
                    Body: zipBuffer,
                };
                yield controllerHelpers_1.s3client.send(new client_s3_1.PutObjectCommand(s3params))
                    .then((response) => {
                    logger_1.log.info("PutObject succeeded, uploaded to S3:", response.$metadata);
                })
                    .catch((error) => {
                    logger_1.log.error("Error storing object to S3:", error);
                    throw (error);
                });
            }
            else {
                return res.status(400).json({ error: 'Invalid package creation request: Bad set of Content and URL' });
            }
            logger_1.log.info("new package's id:", info);
            // set s3path with package id
            s3path = "https://pckstore.s3.amazonaws.com" + "/packages/" + id + ".zip";
            // Check if package exists already
            const existsParams = {
                TableName: "packages",
                Key: {
                    id: { N: id },
                },
            };
            let exists = false;
            const existsCommand = new client_dynamodb_1.GetItemCommand(existsParams);
            yield controllerHelpers_1.dbclient.send(existsCommand)
                .then((response) => {
                logger_1.log.info("GetItem for exists check succeeded:", response.$metadata);
                if (response.Item) {
                    exists = true;
                }
            })
                .catch((error) => {
                logger_1.log.error("Error checking for existence:", error);
                throw (error);
            });
            if (exists) {
                return res.status(409).json({ error: 'Invalid package creation request: Package already exists' });
            }
            // Date of activity using ISO-8601 Datetime standard in UTC format.
            const date = new Date();
            const isoDate = date.toISOString();
            // Package metadata
            const metadata = {
                ID: id,
                Name: info.NAME,
                Version: info.VERSION,
            };
            // Create package history entry
            const history = {
                Action: "CREATE",
                Date: isoDate,
                PackageMetadata: metadata,
                User: controllerHelpers_1.defaultUser,
            };
            // Create package history entry in packageHistory table
            const historyParams = {
                TableName: "packageHistory",
                Item: {
                    name: { S: info.NAME },
                    history: { L: [{ S: JSON.stringify(history) }] },
                },
            };
            const historyCommand = new client_dynamodb_1.PutItemCommand(historyParams);
            yield controllerHelpers_1.dbclient.send(historyCommand)
                .then((response) => {
                logger_1.log.info("PutItem for history succeeded:", response.$metadata);
            })
                .catch((error) => {
                logger_1.log.error("Error putting item for history:", error);
                throw (error);
            });
            // Create the package
            const params = {
                TableName: "packages",
                Item: {
                    id: { N: id },
                    name: { S: info.NAME },
                    version: { S: info.VERSION },
                    s3path: { S: s3path },
                    repoURL: { S: info.URL },
                    Value: { S: JSON.stringify(info) },
                },
            };
            const command = new client_dynamodb_1.PutItemCommand(params);
            yield controllerHelpers_1.dbclient.send(command)
                .then((response) => {
                logger_1.log.info("GetItem succeeded:", response.$metadata);
            })
                .catch((error) => {
                logger_1.log.error("Error getting item:", error);
                throw (error);
            });
            // Respond with a success message and the created package data
            const createdPackage = [
                {
                    "metadata": {
                        "Name": info.NAME,
                        "Version": info.VERSION,
                        "ID": id
                    },
                    "data": {
                        "Content": "",
                        // "JSProgram": "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n"
                    }
                }
            ];
            res.status(201).json(createdPackage);
        }
        catch (error) {
            logger_1.log.error('Error handling POST /package:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.createPackage = createPackage;
