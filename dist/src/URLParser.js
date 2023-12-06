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
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
class URLParser {
    constructor(filePath) {
        this.filePath = filePath;
    }
    getUrls() {
        const fileContent = (0, fs_1.readFileSync)(this.filePath, "utf-8");
        const urls = fileContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        return urls;
    }
    getGithubRepoInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const githubUrls = yield this.getOnlyGithubUrls();
            const githubRepoInfo = [];
            githubUrls.forEach((url) => {
                const regex = /github\.com\/([^/]+\/[^/]+)/;
                const match = url.match(regex);
                if (match != null) {
                    const owner = match[1].split("/")[0];
                    let repo = match[1].split("/")[1];
                    // remove .git from repo name
                    if (repo.endsWith(".git")) {
                        repo = repo.slice(0, -4);
                    }
                    githubRepoInfo.push({ url, owner, repo });
                }
            });
            return githubRepoInfo;
        });
    }
    getGithubRepoInfoFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let githubLink = url;
            if (url.includes("npmjs.com")) {
                const link = yield this.getGithubRepoFromNpm(url);
                if (link != null) {
                    githubLink = link;
                }
                else {
                    return null;
                }
            }
            if (githubLink.includes("github.com")) {
                const regex = /github\.com\/([^/]+\/[^/]+)/;
                const match = url.match(regex);
                if (match != null) {
                    const owner = match[1].split("/")[0];
                    let repo = match[1].split("/")[1];
                    // remove .git from repo name
                    if (repo.endsWith(".git")) {
                        repo = repo.slice(0, -4);
                    }
                    return { url, owner, repo };
                }
            }
            return null;
        });
    }
    getOnlyGithubUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            const allUrls = this.getUrls();
            const npmUrls = allUrls.filter((url) => url.includes("npmjs.com"));
            const githubUrls = allUrls.filter((url) => url.includes("github.com"));
            const additionalGithubUrls = [];
            for (const npmUrl of npmUrls) {
                const link = yield this.getGithubRepoFromNpm(npmUrl);
                if (link != null) {
                    additionalGithubUrls.push(link);
                }
            }
            return githubUrls.concat(additionalGithubUrls);
        });
    }
    getGithubRepoFromNpm(npmUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageName = this.extractPackageNameFromNpmLink(npmUrl);
            let githubLink = null;
            if (packageName != null) {
                const endpoint = `https://registry.npmjs.org/${packageName}`;
                yield axios_1.default
                    .get(endpoint)
                    .then((res) => {
                    const data = res.data;
                    // console.log(data);
                    let linkEnding = data["repository"]["url"];
                    linkEnding = this.extractGithubRepo(linkEnding);
                    if (linkEnding != null) {
                        githubLink = "https://github.com/" + linkEnding;
                    }
                })
                    .catch(() => {
                    console.error("Error getting github repo from npm link for " + packageName + ".");
                });
            }
            return githubLink || null;
        });
    }
    extractGithubRepo(url) {
        const regex = /github\.com\/([^/]+\/[^/]+)\.git/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    extractPackageNameFromNpmLink(url) {
        const regex = /https:\/\/www\.npmjs\.com\/package\/([^/]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}
exports.default = URLParser;
