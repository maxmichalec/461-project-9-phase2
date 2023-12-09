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
exports.DependencyPins = exports.PullRequests = exports.Correctness = exports.RampUp = exports.License = exports.Responsiveness = exports.BusFactor = exports.BaseMetric = void 0;
const octokit_1 = require("octokit");
const node_fetch_1 = __importDefault(require("node-fetch"));
const { graphql } = require("@octokit/graphql");
const graphql_1 = require("@octokit/graphql");
const fs_1 = __importDefault(require("fs"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const isomorphic_git_1 = require("isomorphic-git");
const path_1 = __importDefault(require("path"));
const tmp_1 = require("tmp");
const logger_1 = require("./logger");
// This is our class for all metrics.
class BaseMetric {
    constructor(owner, repo) {
        // NOTE: Not necessary to implement the interface properties, but I think it's good practice.
        //       Also, initializing a default value. These will get overwritten by the subclass.
        this.name = "BaseMetric";
        this.description = "BaseMetricDescription";
        this.owner = owner;
        this.repo = repo;
        // NOTE: I'm not sure, but I think we need an Octokit for each metric
        //       I'll put this here, but feel free to change this.
        this.octokit = new octokit_1.Octokit({ auth: process.env.GITHUB_TOKEN, request: { fetch: node_fetch_1.default } });
    }
}
exports.BaseMetric = BaseMetric;
// A subclass of BaseMetric.
class BusFactor extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "BusFactor";
        this.description = "Measures how many developers are essential for the project.";
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawBusFactorMax = 10; //implicitly set by our formula taking min(rawBusFactor//10, 1)
            try {
                const { repository } = yield graphql(`
				query {
					repository(owner:"${this.owner}", name:"${this.repo}") {
					defaultBranchRef {
						target {
						... on Commit {
							history {
							totalCount
							}
						}
						}
					}
					}
				}
				`, {
                    headers: {
                        authorization: `token ${process.env.GITHUB_TOKEN}`,
                    },
                });
                // https://stackoverflow.com/questions/49442317/github-graphql-repository-query-commits-totalcount
                const halfTotalCommits = Math.floor(repository.defaultBranchRef.target.history.totalCount / 2);
                const contributors = yield this.octokit.rest.repos.listContributors({
                    per_page: rawBusFactorMax,
                    owner: this.owner,
                    repo: this.repo,
                });
                let rawBusFactor = 0;
                let topContributorCommitNum = 0;
                for (const contributor of contributors.data) {
                    rawBusFactor += 1;
                    topContributorCommitNum += contributor.contributions;
                    if (topContributorCommitNum > halfTotalCommits) {
                        break;
                    }
                }
                return Math.min(rawBusFactor / rawBusFactorMax, 1);
            }
            catch (error) {
                // Octokit errors always have a `error.status` property which is the http response code
                if (error instanceof octokit_1.RequestError || error instanceof graphql_1.GraphqlResponseError) {
                    console.error("Octokit error evaluating BusFactor: ", error);
                }
                else {
                    // handle all other errors
                    console.error("non-Octokit error evaluating BusFactor: ", error);
                }
                return 0;
            }
            // return 0.5; // Just a placeholder. TODO: implement.
        });
    }
}
exports.BusFactor = BusFactor;
// A subclass of BaseMetric.
class Responsiveness extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "Responsiveness";
        this.description = "Measures how quickly the developers react to changes in the module.";
    }
    getAverageDaysPR() {
        return __awaiter(this, void 0, void 0, function* () {
            const numCloseTimes = 70; //get the last {numCloseTimes}
            //values greater than 100 have the same effect as 100 (effectively min(val, 100))
            //greater values give a clearer picture but may reach back undesirably far / cause slower runtime
            try {
                // Get the last {numCloseTimes} closed issues
                const { data: closedPRs } = yield this.octokit.rest.pulls.list({
                    owner: this.owner,
                    repo: this.repo,
                    state: "closed",
                    per_page: numCloseTimes,
                    last: numCloseTimes,
                });
                if (closedPRs.length === 0) {
                    logger_1.log.debug("No closed PRs found in the repository.");
                    return null;
                }
                // Calculate the average time to close
                const averageTimeToClose = closedPRs.reduce((total, issue) => {
                    if (issue.closed_at == null) {
                        logger_1.log.error("A closed PR does not have a closed date: ", issue.title);
                        return 0;
                    }
                    else {
                        const closedAt = new Date(issue.closed_at).getTime();
                        const createdAt = new Date(issue.created_at).getTime();
                        return total + (closedAt - createdAt);
                    }
                }, 0) / closedPRs.length;
                // Convert milliseconds to days
                const averageDaysToClose = averageTimeToClose / (1000 * 60 * 60 * 24);
                return averageDaysToClose;
            }
            catch (error) {
                if (error instanceof octokit_1.RequestError || error instanceof graphql_1.GraphqlResponseError) {
                    console.error("Error fetching data from GitHub:", error.message);
                }
                else {
                    console.error("Non-Github error ", error);
                }
                return null;
            }
        });
    }
    getCloseRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            //returns the ratio of (closed issues/all issues) last updated within the last 6 months
            //if this project has no issues updated within last 6 months, returns 0
            const today = new Date();
            today.setMonth(today.getMonth() - 6);
            const sixMonthsAgoISO = today.toISOString();
            try {
                const { repository } = yield graphql(`
				query {
					repository(owner: "${this.owner}", name: "${this.repo}") {
						closed: issues(
						states: [CLOSED]
						filterBy: { since: "${sixMonthsAgoISO}" } 
						) {
							totalCount
						}
						all: issues(
							filterBy: {since: "${sixMonthsAgoISO}" }
						) {
							totalCount
						}
					}
				}
				`, {
                    headers: {
                        authorization: `token ${process.env.GITHUB_TOKEN}`,
                    },
                });
                return (repository.all.totalCount &&
                    repository.closed.totalCount / repository.all.totalCount);
                //if no issues, return 0 (indicates lower responsiveness) else return ratio
            }
            catch (error) {
                if (error instanceof octokit_1.RequestError || error instanceof graphql_1.GraphqlResponseError) {
                    console.error("Error fetching data from GitHub:", error.message);
                }
                else {
                    console.error("Non-Github error ", error);
                }
                return null;
            }
        });
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawAverageDaysPR = yield this.getAverageDaysPR(); //value >  0 | null
            const rawCloseRatio = yield this.getCloseRatio(); // 1 >= value >= 0 | null
            if (rawAverageDaysPR == null || rawCloseRatio == null) {
                //handle error'd values as desired
                return 0;
            }
            const weightDaysPR = 0.8; //tune balance by changing this value
            const weightCloseRatio = 1 - weightDaysPR;
            const falloffHarshness = 0.3;
            //value within (0, 1), higher values punish more severely
            const scaledDaysPR = Math.exp(-falloffHarshness * rawAverageDaysPR);
            return scaledDaysPR * weightDaysPR + rawCloseRatio * weightCloseRatio;
        });
    }
}
exports.Responsiveness = Responsiveness;
// A subclass of BaseMetric.
class License extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "License";
        this.description = "Determines if the license is compatable with LGPLv2.1.";
    }
    isCompatibleWithLGPL(readme) {
        // Define Regular Expressions to match different licenses
        // https://www.gnu.org/licenses/license-list.html#GPLCompatibleLicenses
        // Used above link as a reference
        const licensesRegex = [
            /gpl/i,
            /gnu lesser general public license/i,
            /gnu general public license/i,
            /gnu affero public license/i,
            /gnu all-permissive license/i,
            /mit/i,
            /apache2/i,
            /apache 2/i,
            /apache-2/i,
            /apache license, version 2/i,
            /artistic/i,
            /bsd/i,
            /ldap/i,
            /cecill/i,
            /cryptix/i,
            /ecos/i,
            /ecl/i,
            /educational community license/i,
            /eiffel/i,
            /eu datagrid/i,
            /eudatagrid/i,
            /expat/i,
            /freetype/i,
            /hpnd/i,
            /historical permission notice and disclaimer/i,
            /imatrix/i,
            /imlib/i,
            /ijg/i,
            /independent jpeg/i,
            /informal license/i,
            /intel open source/i,
            /isc/,
            /mpl/i,
            /mozilla/i,
            /ncsa/i,
            /netscape/i,
            /perl/i,
            /python/i,
            /public domain/i,
            /license of ruby/i,
            /sgi free software/i,
            /ml of new jersey/i,
            /unicode/i,
            /upl/i,
            /universal permissive license/i,
            /unlicense/i,
            /vim/i,
            /w3c/i,
            /webm/i,
            /wtfpl/i,
            /wx/i,
            /x11/i,
            /xfree86/i,
            /zlib/i,
            /zope/i,
        ];
        // Check if any of the license regex matches the README content
        for (const regex of licensesRegex) {
            if (readme.match(regex)) {
                return true;
            }
        }
        // Return false if no compatible license is found
        return false;
    }
    getReadmeLicence(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the README file from GitHub API
                const readmeResponse = yield this.octokit.rest.repos.getReadme({
                    owner,
                    repo,
                    mediaType: {
                        format: "raw",
                    },
                });
                const readmeContent = typeof readmeResponse.data === "string" ? readmeResponse.data : "";
                // Using a regex to find the license section of the README
                const licenseRegex = /(#+\s*License\s*|\bLicense\b\s*\n-+)([\s\S]*?)(#+|$)/i;
                const match = readmeContent.match(licenseRegex);
                if (match === null) {
                    return null;
                }
                // Find if the license is compatible with LGPLv2.1
                if (this.isCompatibleWithLGPL(readmeContent)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.error("Error fetching README: ", error);
                return null; // Will be read as 0 by evaluate()
            }
        });
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.log.info("Evaluating License for", this.owner, this.repo);
            const isGpl = yield this.getReadmeLicence(this.owner, this.repo);
            if (isGpl === true) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }
}
exports.License = License;
// A subclass of BaseMetric.
class RampUp extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "RampUp";
        this.description = "Measures how quickly a developer can get up to speed with the module.";
    }
    doesFileExist(dir, targetFile) {
        try {
            const files = fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const filePath = path_1.default.join(dir, file.name);
                if (file.isDirectory()) {
                    if (this.doesFileExist(filePath, targetFile)) {
                        return true;
                    }
                }
                else if (file.name === targetFile) {
                    return true;
                }
            }
            return false;
        }
        catch (err) {
            logger_1.log.error(`Error reading directory: ${err}`);
            return false;
        }
    }
    calculateSlocToCommentRatio(dir) {
        // NOTE: Only finds comments in .js and .ts files
        // NOTE: Will only look at 10 files at maximum. This is to prevent the metric from taking too long.
        let sloc = 0;
        let comments = 0;
        const files = fs_1.default.readdirSync(dir, { withFileTypes: true });
        let numFilesParsed = 0;
        for (const file of files) {
            if (numFilesParsed >= 10) {
                break;
            }
            const filePath = path_1.default.join(dir, file.name);
            if (file.isDirectory()) {
                const subResult = this.calculateSlocToCommentRatio(filePath);
                sloc += subResult.sloc;
                comments += subResult.comments;
            }
            else if (file.name.endsWith(".js") || file.name.endsWith(".ts")) {
                logger_1.log.debug(`Reading file for sloc to comment ratio: ${filePath}`);
                const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
                const lines = fileContent.split("\n");
                let inCommentBlock = false;
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (inCommentBlock) {
                        comments++;
                        if (trimmedLine.endsWith("*/")) {
                            inCommentBlock = false;
                        }
                    }
                    else if (trimmedLine.startsWith("/*")) {
                        inCommentBlock = true;
                        comments++;
                    }
                    else if (trimmedLine.startsWith("//")) {
                        comments++;
                    }
                    else if (trimmedLine.length > 0) {
                        sloc++;
                    }
                }
            }
            numFilesParsed += 1; // We have parsed a file
        }
        return { sloc, comments };
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.log.info(`Evaluating RampUp for ${this.owner}/${this.repo}`);
            logger_1.log.info(`Cloning ${this.owner}/${this.repo}`);
            // Create a temp directory and clone the repo into it
            const tmpdir = (0, tmp_1.dirSync)({ unsafeCleanup: true });
            logger_1.log.info(`Created temp directory: ${tmpdir.name}`);
            logger_1.log.info(`https://github.com/${this.owner}/${this.repo}.git`);
            try {
                yield (0, isomorphic_git_1.clone)({
                    fs: fs_1.default,
                    http: node_1.default,
                    dir: tmpdir.name,
                    url: `https://github.com/${this.owner}/${this.repo}.git`,
                    singleBranch: true,
                    depth: 1,
                });
                // See if there is a README.md
                logger_1.log.info(`Finding ${this.owner}/${this.repo} README.md`);
                const doesReadmeExist = this.doesFileExist(tmpdir.name, "README.md");
                const readmeScore = doesReadmeExist ? 0.3 : 0;
                // See if there is a CONTRIBUTING.md
                logger_1.log.info(`Finding ${this.owner}/${this.repo} CONTRIBUTING.md`);
                const doesContributingExist = this.doesFileExist(tmpdir.name, "CONTRIBUTING.md");
                const contributingScore = doesContributingExist ? 0.3 : 0;
                // Find the sloc to comment ratio
                logger_1.log.info(`Finding ${this.owner}/${this.repo} comment to sloc ratio`);
                const { sloc, comments } = this.calculateSlocToCommentRatio(tmpdir.name);
                const commentToSlocRatio = comments / (sloc || 1); // Avoid division by zero
                logger_1.log.debug(`sloc: ${sloc}, comments: ${comments}, ratio: ${commentToSlocRatio}`);
                // scale that ratio to a number between 0 and 1
                const commentToSlocRatioScaled = Math.min(commentToSlocRatio, 1);
                const slocCommentRatioScore = commentToSlocRatioScaled * 0.4; // ratio of 50% is max score
                tmpdir.removeCallback(); // Cleanup the temp directory
                // Calculate the score and return it
                return readmeScore + contributingScore + slocCommentRatioScore;
            }
            catch (error) {
                console.error("Failure cloning");
                return 0;
            }
        });
    }
}
exports.RampUp = RampUp;
// A subclass of BaseMetric.
class Correctness extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "Correctness";
        this.description = "Measures how many bugs are in the module.";
        // private async getTestCoverage(): Promise<number> {
        // 	// Placeholder method. You need to decide how to get test coverage and implement here.
        // 	// For now, returning a dummy value.
        // 	return 0.5;
        // }
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for GitHub workflow actions presence
            try {
                const hasWorkflowActions = yield this.hasWorkflowActions();
                // Count TODO or FIXME comments
                const todoFixmeCount = yield this.countTodoFixmeComments();
                // Get test coverage percentage
                //const testCoverage = await this.getTestCoverage();
                // Calculate the ratio of closed issues to total issues
                const { openIssues, closedIssues } = yield this.getIssueCounts();
                logger_1.log.debug("openIssues:", openIssues);
                logger_1.log.debug("closedIssues:", closedIssues);
                let issueRatio = 0;
                if (openIssues + closedIssues !== 0) {
                    issueRatio = closedIssues / (openIssues + closedIssues);
                }
                else {
                    console.warn("Both open and closed issues count are zero.");
                }
                // Logging the components
                logger_1.log.debug("hasWorkflowActions:", hasWorkflowActions);
                logger_1.log.debug("todoFixmeCount:", todoFixmeCount);
                // log.debug("testCoverage:", testCoverage);
                logger_1.log.debug("issueRatio:", issueRatio);
                // Combine all factors to calculate the metric
                const score = (hasWorkflowActions ? 0.3 : 0) +
                    (todoFixmeCount !== 0 ? (1 / todoFixmeCount) * 0.2 : 0) +
                    issueRatio * 0.2;
                // testCoverage * 0.3 +
                return score;
            }
            catch (_a) {
                console.error("Error: Score computed is NaN. See earlier error trace for more details.");
                return 0;
            }
        });
    }
    getIssueCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let openIssuesCount = 0;
            let closedIssuesCount = 0;
            try {
                const openIssuesResponse = yield this.octokit.rest.issues.listForRepo({
                    owner: this.owner,
                    repo: this.repo,
                    state: "open",
                    per_page: 1,
                });
                openIssuesCount = openIssuesResponse.data.length; // Assuming the length gives the count
                const closedIssuesResponse = yield this.octokit.rest.issues.listForRepo({
                    owner: this.owner,
                    repo: this.repo,
                    state: "closed",
                    per_page: 1,
                });
                closedIssuesCount = closedIssuesResponse.data.length; // Assuming the length gives the count
            }
            catch (error) {
                console.error("Error fetching issue counts:", error);
            }
            return { openIssues: openIssuesCount, closedIssues: closedIssuesCount };
        });
    }
    hasWorkflowActions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to get the workflows directory. If it exists, return true.
                yield this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    owner: this.owner,
                    repo: this.repo,
                    path: ".github/workflows",
                });
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    countTodoFixmeComments() {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            try {
                const files = yield this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    owner: this.owner,
                    repo: this.repo,
                    path: "", // Root directory
                });
                if (Array.isArray(files.data)) {
                    for (const file of files.data) {
                        if (file.type === "file" && file.content) {
                            const decodedContent = Buffer.from(file.content, "base64").toString("utf8");
                            count += (decodedContent.match(/TODO/g) || []).length;
                            count += (decodedContent.match(/FIXME/g) || []).length;
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error evaluating Correctness metric:", error);
                throw new Error("Failed to evaluate Correctness metric");
            }
            return count;
        });
    }
}
exports.Correctness = Correctness;
class PullRequests extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "PullRequestsCodeReviewMetric";
        this.description = "Measures the fraction of code introduced through pull requests with code reviews.";
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Fetch information about pull requests and code reviews using GitHub API
                //Replace these with actual API calls and data processing 
                const totalCodeChanges = yield this.getTotalCodeChanges(); //Total lines of code changes in the repository
                const codeIntroducedThroughPRs = yield this.getPullRequestsWithCodeReviews(); //Lines of code introduced through Pull Requests with code reviews
                let codeReviewFraction = 0;
                //Calculate the fraction of code introduced through PRs with code reviews
                if (totalCodeChanges >= codeIntroducedThroughPRs) {
                    codeReviewFraction = codeIntroducedThroughPRs / totalCodeChanges;
                }
                else {
                    codeReviewFraction = 1;
                }
                return codeReviewFraction;
            }
            catch (error) {
                console.error("Error calculating PullRequestsCodeReviewMetric:", error);
                throw new Error("Failed to evaluate Pull Request metric");
            }
        });
    }
    getTotalCodeChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pullRequests = yield this.octokit.rest.pulls.list({
                    owner: this.owner,
                    repo: this.repo,
                    state: 'all',
                });
                let totalChanges = 0;
                for (const pr of pullRequests.data) {
                    // Fetch the PR's commits
                    const stats = yield this.octokit.rest.pulls.get({
                        owner: this.owner,
                        repo: this.repo,
                        pull_number: pr.number,
                    });
                    totalChanges += stats.data.additions + stats.data.deletions;
                }
                return totalChanges;
            }
            catch (error) {
                console.error("Error fetching code change statistics:", error);
                return 0;
            }
        });
    }
    getPullRequestsWithCodeReviews() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pullRequests = yield this.octokit.rest.pulls.list({
                    owner: this.owner,
                    repo: this.repo,
                    state: 'all',
                });
                let totalChanges = 0;
                for (const pr of pullRequests.data) {
                    // Fetch the PR's review comments
                    const reviewComments = yield this.octokit.rest.pulls.listReviewComments({
                        owner: this.owner,
                        repo: this.repo,
                        pull_number: pr.number,
                    });
                    if (reviewComments.data.length > 0) {
                        // If there are review comments, consider it a code review
                        // Fetch the PR's statistics
                        const stats = yield this.octokit.rest.pulls.get({
                            owner: this.owner,
                            repo: this.repo,
                            pull_number: pr.number,
                        });
                        totalChanges += stats.data.additions + stats.data.deletions;
                    }
                }
                return totalChanges;
            }
            catch (error) {
                console.error('Error fetching data from GitHub:', error);
                return 0; // Handle errors as needed
            }
        });
    }
}
exports.PullRequests = PullRequests;
// A subclass of BaseMetric.
class DependencyPins extends BaseMetric {
    constructor() {
        super(...arguments);
        this.name = "DependencyPins";
        this.description = "Measures the fraction of dependencies that are pinned to a specific version.";
    }
    evaluate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the package.json file
                const packageJson = yield this.octokit.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path: "package.json",
                });
                // Parse the JSON
                if (Array.isArray(packageJson.data)) {
                    const content = packageJson.data[0].content;
                    if (content === undefined) {
                        return 1;
                    }
                    // Note: packageJson.data has attribute content?: string | undefined
                    const packageJsonContent = Buffer.from(content, "base64").toString("utf8");
                    const packageJsonParsed = JSON.parse(packageJsonContent);
                    // Get total number of dependencies and check for 0/undefined
                    const numDependencies = (packageJsonParsed.dependencies) ? (_a = Object.keys(packageJsonParsed.dependencies)) === null || _a === void 0 ? void 0 : _a.length : undefined;
                    if (numDependencies === undefined || numDependencies === 0) { // return 0 on undefined?
                        return 1;
                    }
                    // Calculate the number of dependencies that are pinned
                    const pinnedDependencies = this.numPinnedDeps(packageJsonParsed.dependencies);
                    // Calculate the fraction of dependencies that are pinned
                    const fractionPinned = pinnedDependencies / numDependencies;
                    return Math.min(fractionPinned, 1);
                }
                else {
                    return 1;
                }
            }
            catch (error) {
                console.error("Error calculating DependencyPins:", error);
                return 0;
            }
        });
    }
    numPinnedDeps(dependencies) {
        let pinnedDeps = 0;
        for (const dependency in dependencies) {
            const version = dependencies[dependency];
            if (/^(?:\d+\.\d+\.\d+|\d+\.\d+(\.[\d+\*Xx])?|~\d+\.\d+(\.\d+)?|\^0\.\d+(\.\d+)?|\d+\.\d+(\.[\*Xx])?)$/.test(version)) {
                pinnedDeps++;
            }
        }
        return pinnedDeps;
    }
}
exports.DependencyPins = DependencyPins;
