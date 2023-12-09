"use strict";
/*
 * File: pacakgeby-name.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package/byRegex endpoint for the front-end
 */
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const packageby_regex_component_1 = require("./packageby-regex.component");
const services_1 = require("../api/services");
const testing_2 = require("@angular/common/http/testing");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
describe('PackagebyRegexComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [packageby_regex_component_1.PackagebyRegexComponent],
            imports: [testing_2.HttpClientTestingModule, forms_1.FormsModule, common_1.CommonModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(packageby_regex_component_1.PackagebyRegexComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        apiService = testing_1.TestBed.inject(services_1.ApiService);
        httpTestingController = testing_1.TestBed.inject(testing_2.HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.packageregex).toEqual({
            'RegEx': ''
        });
        expect(component.packages).toEqual([]);
        expect(component.noMatchesFound).toEqual(false);
    });
    // Positive Test Case: Get Packages Successfully
    it('should handle 200 response for well-formed query with valid regex', (0, testing_1.inject)([services_1.ApiService], (service) => {
        const mockResponse = [
            { ID: '1', Name: '*', Version: '' },
            { ID: '2', Name: 'Underscore', Version: '' },
        ];
        // Trigger the HTTP request for packages by regex
        component.getPackageRegEx();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byRegEx',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 200
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        // Check the expectations after the subscription has completed
        expect(component.packages).toEqual(mockResponse);
        expect(component.noMatchesFound).toEqual(false);
    }));
    it('should handle 404 response for well-formed query with valid regex and no matching packages', (0, testing_1.inject)([services_1.ApiService], (service) => {
        const mockResponse = []; // Empty array for no matching packages
        // Trigger the HTTP request for packages by regex
        component.getPackageRegEx();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byRegEx',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 404
        req.flush(mockResponse, { status: 404, statusText: 'Not Found' });
        // Now, check the expectations after the subscription has completed
        expect(component.packages).toEqual([]);
        expect(component.noMatchesFound).toBeTrue();
    }));
    it('should handle 404 response for well-formed query with valid regex taking more than 15 seconds', (0, testing_1.inject)([services_1.ApiService], (service) => {
        // Set the regex to take more than 15 seconds
        component.packageregex.RegEx = 'long-running-regex';
        // Trigger the HTTP request for packages by regex
        component.getPackageRegEx();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byRegEx',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 404
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        // Now, check the expectations after the subscription has completed
        expect(component.packages).toEqual([]);
        expect(component.noMatchesFound).toBeTrue();
    }));
    it('should handle 400 response for malformed query missing RegEx field', (0, testing_1.inject)([services_1.ApiService], (service) => {
        // Set the regex to an empty string to simulate a malformed query
        component.packageregex.RegEx = '';
        // Trigger the HTTP request for packages by regex
        component.getPackageRegEx();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byRegEx',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Now, check the expectations after the subscription has completed
        expect(component.packages).toEqual([]);
        expect(component.noMatchesFound).toBeFalse(); // Malformed query, but noMatchesFound should be false
    }));
});
