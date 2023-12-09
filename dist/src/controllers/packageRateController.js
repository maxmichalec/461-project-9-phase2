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
exports.getPackageRating = void 0;
const logger_1 = require("../logger");
const controllerHelpers_1 = require("./controllerHelpers");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
// Controller function for handling the GET request to /package/{id}/rate
function getPackageRating(req, res) {
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
            // Check for permission to access the package rating (you can add more logic here)
            // Fetch the package rating based on the provided ID
            // Get repo url from DB entry
            let packageURL = "";
            const params = {
                TableName: "packages",
                Key: {
                    id: { N: packageId },
                },
            };
            yield controllerHelpers_1.dbclient.send(new client_dynamodb_1.GetItemCommand(params))
                .then((response) => {
                if (response.Item) {
                    packageURL = response.Item.repoURL.S || "";
                    packageName = response.Item.name.S || "";
                    packageVersion = response.Item.version.S || "";
                }
            })
                .catch((error) => {
                logger_1.log.error("Error fetching package URL from DB:", error);
            });
            if (packageURL === "") {
                return res.status(404).json({ error: 'Package not found' });
            }
            // Rate package, time out after 40 seconds
            logger_1.log.info("Rating package with ID:", packageId, "...");
            const timeoutPromise = (0, controllerHelpers_1.timeout)(40000);
            const infoPromise = (0, controllerHelpers_1.metricCalcFromUrl)(packageURL);
            const result = yield Promise.race([timeoutPromise, infoPromise]);
            if (result === undefined) {
                return res.status(500).json({ error: 'The package rating system choked on at least one of the metrics' });
            }
            else if (result === null) {
                return res.status(500).json({ error: 'The package rating system failed to rate the package' });
            }
            const info = result;
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
                Action: "RATE",
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
            // Respond with the package rating
            const packageRating = {
                "BusFactor": info.BUS_FACTOR_SCORE,
                "Correctness": info.CORRECTNESS_SCORE,
                "RampUp": info.RAMP_UP_SCORE,
                "ResponsiveMaintainer": info.RESPONSIVE_MAINTAINER_SCORE,
                "LicenseScore": info.LICENSE_SCORE,
                "GoodPinningPractice": info.PINNED_DEPENDENCIES_SCORE,
                "PullRequest": info.PULL_REQUESTS_SCORE,
                "NetScore": info.NET_SCORE,
            };
            res.status(200).json(packageRating);
        }
        catch (error) {
            console.error('Error handling /package/{id}/rate:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
        }
    });
}
exports.getPackageRating = getPackageRating;
