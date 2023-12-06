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
const URLParser_1 = __importDefault(require("../src/URLParser"));
describe("URLParser", () => {
    const parser = new URLParser_1.default("Sample Url File.txt");
    it("should extract a list of URLs", () => __awaiter(void 0, void 0, void 0, function* () {
        const URLList = parser.getUrls();
        expect(URLList).toBeDefined();
    }));
    it("should extract package name from npm link", () => __awaiter(void 0, void 0, void 0, function* () {
        const packageName = parser.extractPackageNameFromNpmLink("https://www.npmjs.com/package/browserify");
        expect(packageName).toBe("browserify");
    }));
    it("should extract github repo from janky git link", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepo = parser.extractGithubRepo("git+ssh://git@github.com/browserify/browserify.git");
        expect(githubRepo).toBe("browserify/browserify");
    }));
    it("should extract github repo from npm link", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepo = yield parser.getGithubRepoFromNpm("https://www.npmjs.com/package/browserify");
        expect(githubRepo).toBe("https://github.com/browserify/browserify");
    }));
    it("should get all github links from list of links", () => __awaiter(void 0, void 0, void 0, function* () {
        const onlyGithubLinks = yield parser.getOnlyGithubUrls();
        for (const link of onlyGithubLinks) {
            expect(link).toContain("github.com");
        }
    }));
    it("should return a list of gitHubInfo objects", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepoInfoList = yield parser.getGithubRepoInfo();
        expect(githubRepoInfoList.length).toBe((yield parser.getOnlyGithubUrls()).length);
        for (const info of githubRepoInfoList) {
            expect(info).toBeDefined();
            expect(info.owner).toBeDefined();
            expect(info.repo).toBeDefined();
        }
    }));
    it("should have null when the link is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepo = yield parser.getGithubRepoFromNpm("fake link doesn't work");
        expect(githubRepo).toBeNull();
    }));
    it("should be null when the link is invalid for github", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepo = yield parser.getGithubRepoFromNpm("https://www.npmjs.com/package/fakepackagenoexistofake");
        expect(githubRepo).toBeNull();
    }));
    it("should be null when trying to extract github repo from bad link", () => __awaiter(void 0, void 0, void 0, function* () {
        const githubRepo = parser.extractGithubRepo("fake link doesn't work");
        expect(githubRepo).toBeNull();
    }));
});
