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
exports.setupCLI = void 0;
const commander_1 = require("commander");
const URLParser_1 = __importDefault(require("./URLParser"));
const jest_1 = require("jest");
const metrics_1 = require("./metrics");
const logger_1 = require("./logger");
function setupCLI() {
    const program = new commander_1.Command();
    program.version("0.0.1").description("A CLI for trustworthy module reuse");
    // NOTE:  ./run install is handled completely within the ./run file.
    program
        .command("test")
        .description("Runs tests")
        .action(() => __awaiter(this, void 0, void 0, function* () {
        // Mute stdout and stderr
        const originalStdoutWrite = process.stdout.write.bind(process.stdout);
        process.stdout.write = () => true;
        const originalStderrWrite = process.stderr.write.bind(process.stderr);
        process.stderr.write = () => true;
        // Setup and run jest tests
        const config = {
            collectCoverage: true,
            reporters: ["default"],
            silent: true,
            verbose: false,
            preset: "ts-jest",
            testEnvironment: "node",
            setupFiles: ["dotenv/config"],
            testTimeout: 20000,
        };
        // Been working at this for a long time. I'm not sure how to get the types to work here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { results } = yield (0, jest_1.runCLI)(config, [process.cwd() + "/jest.config.js"]);
        // Restore stdout and stderr
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;
        // Get test results and print them
        const totalTests = results.numTotalTests;
        const passedTests = results.numPassedTests;
        const coverage = results.coverageMap
            ? results.coverageMap.getCoverageSummary().toJSON().lines.pct
            : 0;
        console.log(`${passedTests}/${totalTests} test cases passed. ${Math.ceil(coverage)}% line coverage achieved.`);
    }));
    program
        .arguments("<file>")
        .description("Takes in a file of URLs and outputs the score of each repo")
        .action((file) => __awaiter(this, void 0, void 0, function* () {
        // You need a LOG_FILE and GITHUB_TOKEN env variable to run this command
        const isNoLogFileEnv = process.env.LOG_FILE === undefined || process.env.LOG_FILE === "";
        const isNoGithubTokenEnv = process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === "";
        if (isNoLogFileEnv || isNoGithubTokenEnv) {
            process.exit(1);
        }
        const urlParser = new URLParser_1.default(file);
        const repoInfoList = yield urlParser.getGithubRepoInfo();
        const RepoMetricInfoList = [];
        for (const repoInfo of repoInfoList) {
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
            const pullrequestsMetric = new metrics_1.PullRequests(repoInfo.owner, repoInfo.repo);
            const pullrequestsMetricScore = yield pullrequestsMetric.evaluate();
            const pinnedDependenciesMetric = new metrics_1.DependencyPins(repoInfo.owner, repoInfo.repo);
            const pinnedDependenciesMetricScore = yield pinnedDependenciesMetric.evaluate();
            /*
            console.log("Ramp Up Score: " + rampupMetricScore);
            console.log("Correctness Score: " + correctnessMetricScore);
            console.log("Bus Factor Score: " + busFactorMetricScore);
            console.log("Responsiveness Score: " + responsivenessMetricScore);
            console.log("License Score: " + licenseMetricScore);
            */
            // console.log("Pull Request Score:" + pullrequestsMetricScore);
            const netScore = (rampupMetricScore * 0.2 +
                correctnessMetricScore * 0.1 +
                busFactorMetricScore * 0.25 +
                responsivenessMetricScore * 0.25 +
                pullrequestsMetricScore * 0.1 +
                pinnedDependenciesMetricScore * 0.1) *
                licenseMetricScore;
            logger_1.log.debug("Net Score: " + netScore);
            const currentRepoInfoScores = {
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
            RepoMetricInfoList.push(currentRepoInfoScores);
        }
        for (const repoInfo of RepoMetricInfoList) {
            console.log(JSON.stringify(repoInfo));
        }
    }));
    program
        .command("test:URLParser")
        .description("Runs manual tests for URLParser")
        .action(() => {
        const urlParser = new URLParser_1.default("./Sample Url File.txt");
        const urls = urlParser.getUrls();
        console.log(urls);
        urlParser.getOnlyGithubUrls().then((urls) => {
            console.log(urls);
        });
        urlParser.getGithubRepoInfo().then((info) => {
            console.log(info);
        });
    });
    program.parse();
}
exports.setupCLI = setupCLI;
