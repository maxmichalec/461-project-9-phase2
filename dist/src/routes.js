"use strict";
/*
 * File: routes.ts
 * Author: Madi Arnold
 * Description: The routes for all of the endpoints and what functions the logic is in for each of them
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const packagesController_1 = require("./controllers/packagesController");
const resetController_1 = require("./controllers/resetController");
const packageController_1 = require("./controllers/packageController");
const packageController_2 = require("./controllers/packageController");
const packageController_3 = require("./controllers/packageController");
const packageController_4 = require("./controllers/packageController");
const packageRateController_1 = require("./controllers/packageRateController");
const authenticationController_1 = require("./controllers/authenticationController");
const packageNameController_1 = require("./controllers/packageNameController");
const packageNameController_2 = require("./controllers/packageNameController");
const packageRegexController_1 = require("./controllers/packageRegexController");
const router = express_1.default.Router();
// Define the route for handling the POST request to /packages
router.post('/packages', packagesController_1.getPackages);
// Define the route for handling the DELETE request to /reset
router.delete('/reset', resetController_1.resetRegistry);
//Define the route for handling the GET requeest to /package/{id}
router.get('/package/:id', packageController_1.getPackageById);
// Define the route for handling the PUT request to update a package by ID
router.put('/package/:id', packageController_2.updatePackage);
// Define the route for handling the DELETE request to /package/:id
router.delete('/package/:id', packageController_3.deletePackage);
// Define the route for handling the POST request to /package
router.post('/package', packageController_4.createPackage);
// Define the route for handling the GET request to /package/{id}/rate
router.get('/package/:id/rate', packageRateController_1.getPackageRating);
// Define the route for handling the PUT request to /authenticate
router.put('/authenticate', authenticationController_1.createAuthToken);
// Define the route for handling the GET request to /package/byName/{name}
router.get('/package/byName/:name', packageNameController_1.getPackageHistoryByName);
// Define the route for handling the DELETE request to /package/byName/{name}
router.delete('/package/byName/:name', packageNameController_2.deletePackageByName);
router.post('/package/byRegEx', packageRegexController_1.postPackageByRegEx);
exports.default = router;
