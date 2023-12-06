#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // loads .env file into process.env. NOTE: this should be the first line
const cli_1 = require("./cli");
// Run the evaluation
(0, cli_1.setupCLI)();
