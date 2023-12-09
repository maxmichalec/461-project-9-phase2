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
require("dotenv/config"); // loads .env file into process.env. NOTE: this should be the first line
const metrics_1 = require("../src/metrics");
describe("BusFactor", () => {
    it("should return a bus factor", () => __awaiter(void 0, void 0, void 0, function* () {
        const busFactorMetric = new metrics_1.BusFactor("neovim", "neovim");
        const score = yield busFactorMetric.evaluate();
        expect(score).toBeDefined();
        expect(busFactorMetric.name).toBe("BusFactor");
        expect(score).toBeGreaterThan(0);
    }));
    it("should not find a repo to return a bus factor", () => __awaiter(void 0, void 0, void 0, function* () {
        const busFactorMetric = new metrics_1.BusFactor("neovm", "neovim");
        const score = yield busFactorMetric.evaluate();
        expect(score).toBeDefined();
        expect(busFactorMetric.name).toBe("BusFactor");
        expect(score).toEqual(0);
    }));
});
describe("Responsiveness", () => {
    it("should return a responsiveness score", () => __awaiter(void 0, void 0, void 0, function* () {
        const respMetric = new metrics_1.Responsiveness("neovim", "neovim");
        const score = yield respMetric.evaluate();
        expect(score).toBeDefined();
        expect(respMetric.name).toBe("Responsiveness");
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
    }));
    it("should trigger the no PRs edge case", () => __awaiter(void 0, void 0, void 0, function* () {
        const respMetric = new metrics_1.Responsiveness("FaaizMemonPurdue", "exampleRepoNoPRs");
        const score = yield respMetric.evaluate();
        expect(score).toBeDefined();
        expect(respMetric.name).toBe("Responsiveness");
    }));
    it("should not find a repo to return responsiveness", () => __awaiter(void 0, void 0, void 0, function* () {
        const respMetric = new metrics_1.Responsiveness("neovm", "neovim");
        const score = yield respMetric.evaluate();
        expect(score).toBeDefined();
        expect(respMetric.name).toBe("Responsiveness");
        expect(score).toEqual(0);
    }));
});
describe("License", () => {
    it("should return a license score", () => __awaiter(void 0, void 0, void 0, function* () {
        const licenseMetric = new metrics_1.License("neovim", "neovim");
        const score = yield licenseMetric.evaluate();
        expect(score).toBeDefined();
        expect(licenseMetric.name).toBe("License");
    }));
    it("should indicate if a license is *NOT* GPL", () => __awaiter(void 0, void 0, void 0, function* () {
        const licenseMetric = new metrics_1.License("CtrlAltDelight", "test-repo");
        const score = yield licenseMetric.evaluate();
        expect(score).toBeDefined();
        expect(licenseMetric.name).toBe("License");
        expect(score).toEqual(0);
    }));
    it("should indicate if a license is GPL", () => __awaiter(void 0, void 0, void 0, function* () {
        const licenseMetric = new metrics_1.License("gwpy", "gwpy");
        const score = yield licenseMetric.evaluate();
        expect(score).toBeDefined();
        expect(licenseMetric.name).toBe("License");
        expect(score).toEqual(1);
    }));
    it("should not find a repo to return license", () => __awaiter(void 0, void 0, void 0, function* () {
        const licenseMetric = new metrics_1.License("neovm", "neovim");
        const score = yield licenseMetric.evaluate();
        expect(score).toBeDefined();
        expect(licenseMetric.name).toBe("License");
        expect(score).toEqual(0);
    }));
});
describe("RampUp", () => {
    it("should find the readme.md and contributing.md", () => __awaiter(void 0, void 0, void 0, function* () {
        const rampUpMetric = new metrics_1.RampUp("neovim", "neovim");
        const score = yield rampUpMetric.evaluate();
        expect(score).toBeDefined();
        expect(rampUpMetric.name).toBe("RampUp");
        // I know this repo has a contributing.md and readme.md
        expect(score).toBeGreaterThanOrEqual(0.6);
    }));
    it("should find the readme.md and no contributing.md", () => __awaiter(void 0, void 0, void 0, function* () {
        const rampUpMetric = new metrics_1.RampUp("jonschlinkert", "is-odd");
        const score = yield rampUpMetric.evaluate();
        expect(score).toBeDefined();
        expect(rampUpMetric.name).toBe("RampUp");
        // I know jonschlinkert/is-odd has a readme.md but no contributing.md
        expect(score).toBeGreaterThanOrEqual(0.3);
        expect(score).toBeLessThanOrEqual(0.7);
    }));
    it("should not find a repo to return rampup", () => __awaiter(void 0, void 0, void 0, function* () {
        const rampUpMetric = new metrics_1.RampUp("neovm", "neovim");
        const score = yield rampUpMetric.evaluate();
        expect(score).toBeDefined();
        expect(rampUpMetric.name).toBe("RampUp");
        expect(score).toEqual(0);
    }));
});
describe("Correctness", () => {
    it("should return a correctness score", () => __awaiter(void 0, void 0, void 0, function* () {
        const correctnessMetric = new metrics_1.Correctness("neovim", "neovim");
        const score = yield correctnessMetric.evaluate();
        expect(score).toBeDefined();
        expect(correctnessMetric.name).toBe("Correctness");
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
    }));
    it("should not find a repo to return correctness", () => __awaiter(void 0, void 0, void 0, function* () {
        const correctnessMetric = new metrics_1.Correctness("neovm", "neovim");
        const score = yield correctnessMetric.evaluate();
        expect(score).toBeDefined();
        expect(correctnessMetric.name).toBe("Correctness");
        expect(score).toEqual(0);
    }));
});
describe("DependencyPins", () => {
    it("should return a dependency pin metric score", () => __awaiter(void 0, void 0, void 0, function* () {
        const pinnedDependenciesMetric = new metrics_1.DependencyPins("neovim", "neovim");
        const score = yield pinnedDependenciesMetric.evaluate();
        expect(score).toBeDefined();
        expect(pinnedDependenciesMetric.name).toBe("DependencyPins");
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    }));
    it("should not find a repo to return dependency pin metric", () => __awaiter(void 0, void 0, void 0, function* () {
        const pinnedDependenciesMetric = new metrics_1.DependencyPins("neovm", "neovim");
        const score = yield pinnedDependenciesMetric.evaluate();
        expect(score).toBeDefined();
        expect(pinnedDependenciesMetric.name).toBe("DependencyPins");
        expect(score).toEqual(0);
    }));
});
