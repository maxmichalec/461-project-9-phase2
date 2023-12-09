"use strict";
/*
 * File: pacakgeby-name.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package/byName endpoint for the front-end
 */
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const packageby_name_component_1 = require("./packageby-name.component");
const services_1 = require("../api/services");
const testing_2 = require("@angular/common/http/testing");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
describe('PackagebyNameComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [packageby_name_component_1.PackagebyNameComponent],
            imports: [testing_2.HttpClientTestingModule, forms_1.FormsModule, common_1.CommonModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(packageby_name_component_1.PackagebyNameComponent);
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
        expect(component.packageName).toEqual('');
        expect(component.packageHistory).toEqual([]);
    });
    it('should get package history successfully with 200 code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Set up some test data
        const mockResponse = [
            {
                Action: 'CREATE',
                Date: '2023-01-01T12:00:00Z',
                PackageMetadata: { ID: '1', Name: 'ExamplePackage', Version: '1.0.0' },
                User: { isAdmin: true, name: 'Test User' },
            },
        ];
        // Trigger the HTTP request for getting package history
        component.getPackageHistory(); // Make sure getPackageHistory is called
        // Expect a single request to a specific URL with specific headers and parameters
        const req = backend.expectOne({
            url: 'http://localhost:9000/package/byName/',
            method: 'GET',
        });
        // Respond to the request with a mock response and status 200
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        // Now, check the expectations after the subscription has completed
        expect(component.packageHistory).toEqual(mockResponse);
        expect(component.packageHistory.length).toEqual(1);
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should handle 404 status for non-existing package', (0, testing_1.inject)([services_1.ApiService], (service) => {
        const mockResponse = []; // Empty array for non-existing package
        // Trigger the HTTP request for getting package history
        component.getPackageHistory();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byName/',
            method: 'GET',
        });
        // Respond to the request with a mock response and status 404
        req.flush(mockResponse, { status: 404, statusText: 'Not Found' });
        // Now, check the expectations after the subscription has completed
        expect(component.packageHistory).toEqual([]); // Ensure it remains an empty array or handle as needed
    }));
    it('should handle 400 status for malformed query', (0, testing_1.inject)([services_1.ApiService], (service) => {
        // Trigger the HTTP request for getting package history
        component.getPackageHistory();
        // Expect a single request to a specific URL with specific headers and parameters
        const req = httpTestingController.expectOne({
            url: 'http://localhost:9000/package/byName/',
            method: 'GET',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Package history should remain an empty array
        expect(component.packageHistory).toEqual([]);
    }));
});
