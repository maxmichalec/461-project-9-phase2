"use strict";
/*
 * File: app.ts
 * Author: Madi Arnold
 * Description: The main file for our backend that gets up the port and enables CORS for all routes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 9000;
const cors = require('cors');
app.use(express_1.default.json({ limit: '50mb' })); // Middleware to parse JSON request bodies
app.use(cors());
// Enable CORS for all routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express_1.default.json()); // Middleware to parse JSON request bodies
app.use('/', routes_1.default); // Use your defined routes
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
