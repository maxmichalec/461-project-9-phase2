"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * File: packages.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the packages endpoint for the front-end
 */
const testing_1 = require("@angular/core/testing");
const testing_2 = require("@angular/common/http/testing");
const rxjs_1 = require("rxjs");
const packages_component_1 = require("./packages.component");
const services_1 = require("../api/services");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
describe('PackagesComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [packages_component_1.PackagesComponent],
            imports: [testing_2.HttpClientTestingModule, forms_1.FormsModule, common_1.CommonModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(packages_component_1.PackagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        apiService = testing_1.TestBed.inject(services_1.ApiService);
        httpTestingController = testing_1.TestBed.inject(testing_2.HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });
    // Initial Test Case: Packages Component Created
    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.packageName).toEqual('');
        expect(component.packageVersion).toEqual('');
        expect(component.packages).toEqual([]);
    });
    // Positive Test Case: Get Packages Successfully
    it('should handle well-formed API query to /packages with a valid name and version search', () => {
        const mockResponse = [
            { ID: '', Name: 'Package1', Version: '1.0.0' },
            { ID: '', Name: 'Package2', Version: '2.0.0' },
        ];
        spyOn(apiService, 'packagesList').and.returnValue((0, rxjs_1.of)(mockResponse));
        component.packageName = 'Package1';
        component.packageVersion = '1.0.0';
        component.onSubmit();
        expect(apiService.packagesList).toHaveBeenCalledWith({
            'X-Authorization': component.authHeader,
            offset: '',
            body: [{ Name: 'Package1', Version: '1.0.0' }],
        });
        expect(component.packages).toEqual(mockResponse);
        expect(component.packages.length).toEqual(2);
        expect(component.packages[0].Name).toEqual('Package1');
        expect(component.packages[0].Version).toEqual('1.0.0');
        expect(component.packages[1].Name).toEqual('Package2');
        expect(component.packages[1].Version).toEqual('2.0.0');
    });
    it('should expect HTTP response to be 200 for well-formed query', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockResponse = [
            { ID: '', Name: 'Package1', Version: '1.0.0' },
            { ID: '', Name: 'Package2', Version: '2.0.0' },
        ];
        // Trigger the HTTP request
        service.packagesList({
            'X-Authorization': component.authHeader,
            offset: '',
            body: [{ Name: 'Package1', Version: '1.0.0' }]
        }).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });
        // Expect a single request to a specific URL
        const req = backend.expectOne({
            url: 'http://localhost:9000/packages?offset=',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 200
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to be 200 for well-formed query with *', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockResponse = [
            { ID: '', Name: '*', Version: '' },
        ];
        // Trigger the HTTP request
        service.packagesList({
            'X-Authorization': component.authHeader,
            offset: '',
            body: [{ Name: '*', Version: '' }]
        }).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });
        // Expect a single request to a specific URL
        const req = backend.expectOne({
            url: 'http://localhost:9000/packages?offset=',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 200
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to be 200 for n-th package offset', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockResponse = [
            { ID: '', Name: '*', Version: '' },
        ];
        // Trigger the HTTP request
        service.packagesList({
            'X-Authorization': component.authHeader,
            offset: '2',
            body: [{ Name: '*', Version: '' }]
        }).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });
        // Expect a single request to a specific URL
        const req = backend.expectOne({
            url: 'http://localhost:9000/packages?offset=2',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 200
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should handle malformed query and respond with 400 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        service.packagesList({
            'X-Authorization': component.authHeader,
            offset: '',
            // Missing PackageQuery field in the body
            body: [],
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 400 response
        (error) => {
            expect(error.status).toEqual(400);
            expect(error.statusText).toEqual('Bad Request');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: 'http://localhost:9000/packages?offset=',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should handle too many packages and respond with 413 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a query that will return too many packages
        service.packagesList({
            'X-Authorization': component.authHeader,
            offset: '',
            body: [{ Name: 'ValidPackage', Version: '1.0.0' }],
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 413 response
        (error) => {
            expect(error.status).toEqual(413);
            expect(error.statusText).toEqual('Request Entity Too Large');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: 'http://localhost:9000/packages?offset=',
            method: 'POST',
        });
        // Respond to the request with a mock response and status 413
        req.flush('Request Entity Too Large', { status: 413, statusText: 'Request Entity Too Large' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
});
