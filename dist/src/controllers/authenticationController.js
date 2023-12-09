"use strict";
/*
 * File: authenticationController.ts
 * Author: Madi Arnold
 * Description: The /authenticate endpoint, however we are not implementing this endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthToken = void 0;
// Controller function for handling the PUT request to /authenticate
const createAuthToken = (req, res) => {
    return res.status(501).json({ error: 'We do not support authentication' });
};
exports.createAuthToken = createAuthToken;
