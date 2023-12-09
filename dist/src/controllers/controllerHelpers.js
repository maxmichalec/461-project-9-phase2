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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeout = exports.metricCalcFromUrl = exports.generatePackageId = exports.defaultUser = exports.s3client = exports.dbclient = void 0;
const logger_1 = require("../logger");
const uuid_1 = require("uuid");
const URLParser_1 = __importDefault(require("../URLParser"));
const metrics_1 = require("../metrics");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
exports.dbclient = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" });
exports.s3client = new client_s3_1.S3Client({ region: "us-east-1" });
exports.defaultUser = {
    isAdmin: true,
    name: 'James Davis',
};
const generatePackageId = (name, version) => {
    logger_1.log.debug(`Generating id for ${name}@${version}`);
    const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341';
    const uuid = (0, uuid_1.v5)(name + version, namespace);
    // create a 64-bit integer from the uuid
    const id = BigInt.asUintN(64, BigInt(`0x${uuid.replace(/-/g, '')}`)).toString();
    logger_1.log.debug(`Generated package id ${id} for ${name}@${version}`);
    return id;
};
exports.generatePackageId = generatePackageId;
function metricCalcFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlParser = new URLParser_1.default("");
        const repoInfo = yield urlParser.getGithubRepoInfoFromUrl(url);
        logger_1.log.info("repoInfo:", repoInfo);
        if (repoInfo == null) {
            return null;
        }
        //Ramp Up Score
        const rampupMetric = new metrics_1.RampUp(repoInfo.owner, repoInfo.repo);
        const rampupMetricScore = yield rampupMetric.evaluate();
        //Correctness Score
        const correctnessMetric = new metrics_1.Correctness(repoInfo.owner, repoInfo.repo);
        const correctnessMetricScore = yield correctnessMetric.evaluate();
        //Bus Factor Score
        const busFactorMetric = new metrics_1.BusFactor(repoInfo.owner, repoInfo.repo);
        const busFactorMetricScore = yield busFactorMetric.evaluate();
        //Responsiveness Score
        const responsivenessMetric = new metrics_1.Responsiveness(repoInfo.owner, repoInfo.repo);
        const responsivenessMetricScore = yield responsivenessMetric.evaluate();
        //License Score
        const licenseMetric = new metrics_1.License(repoInfo.owner, repoInfo.repo);
        const licenseMetricScore = yield licenseMetric.evaluate();
        // Pull Requests Score
        const pullrequestsMetric = new metrics_1.PullRequests(repoInfo.owner, repoInfo.repo);
        const pullrequestsMetricScore = yield pullrequestsMetric.evaluate();
        // Pinned Dependencies Score
        const pinnedDependenciesMetric = new metrics_1.DependencyPins(repoInfo.owner, repoInfo.repo);
        const pinnedDependenciesMetricScore = yield pinnedDependenciesMetric.evaluate();
        const netScore = (rampupMetricScore * 0.2 +
            correctnessMetricScore * 0.1 +
            busFactorMetricScore * 0.25 +
            responsivenessMetricScore * 0.25 +
            pullrequestsMetricScore * 0.1 +
            pinnedDependenciesMetricScore * 0.1) *
            licenseMetricScore;
        const currentRepoInfoScores = {
            ID: "",
            NAME: repoInfo.repo,
            OWNER: repoInfo.owner,
            VERSION: "1.0.0",
            URL: repoInfo.url,
            NET_SCORE: netScore,
            RAMP_UP_SCORE: rampupMetricScore,
            CORRECTNESS_SCORE: correctnessMetricScore,
            BUS_FACTOR_SCORE: busFactorMetricScore,
            RESPONSIVE_MAINTAINER_SCORE: responsivenessMetricScore,
            LICENSE_SCORE: licenseMetricScore,
            PULL_REQUESTS_SCORE: pullrequestsMetricScore,
            PINNED_DEPENDENCIES_SCORE: pinnedDependenciesMetricScore,
        };
        // log.info("currentRepoInfoScores:", currentRepoInfoScores);
        return currentRepoInfoScores;
    });
}
exports.metricCalcFromUrl = metricCalcFromUrl;
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.timeout = timeout;
