"use strict";
/*
 * File: pacakge.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package endpoint for the front-end
 */
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const package_component_1 = require("./package.component");
const services_1 = require("../api/services");
const testing_2 = require("@angular/common/http/testing");
const rxjs_1 = require("rxjs");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
const filter_out_content_pipe_1 = require("../filter-out-content.pipe");
describe('PackageComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [package_component_1.PackageComponent, filter_out_content_pipe_1.FilterOutContentFieldPipe],
            imports: [testing_2.HttpClientTestingModule, forms_1.FormsModule, common_1.CommonModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(package_component_1.PackageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        apiService = testing_1.TestBed.inject(services_1.ApiService);
        httpTestingController = testing_1.TestBed.inject(testing_2.HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });
    // Initial Test Case: Package Component Created
    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.deletePackageId).toEqual('');
        expect(component.packageId).toEqual('');
        expect(component.getPackageData).toEqual({ data: { Content: '', URL: '', JSProgram: '' }, metadata: { Name: '', Version: '', ID: '' } });
        expect(component.packageData).toEqual({ data: { Content: '', URL: '', JSProgram: '' }, metadata: { Name: '', Version: '', ID: '' } });
        expect(component.updateMessage).toEqual('');
        expect(component.deleteMessage).toEqual('');
        expect(component.postPackageData).toEqual({ Content: '', URL: '', JSProgram: '' });
        expect(component.postPackageDataResponse).toEqual({ data: { Content: '', URL: '', JSProgram: '' }, metadata: { Name: '', Version: '', ID: '' } });
    });
    //
    // Download Package Tests (Package Operations)
    //
    // Positive Test Case: Download Package Successfully
    it('should expect HTTP response to download package to be 200 for well-formed query with package ID', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'mock-package-content';
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.packageData = mockResponse;
        component.packageId = mockPackageId;
        component.getPackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('GET');
        req.flush({ Content: mockZipContent }, { status: 200, statusText: 'OK' });
        expect(component.packageData).toEqual(mockResponse);
        backend.verify();
    }));
    it('should expect HTTP response to download package to be 200 for well-formed query with package ID 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'mock-package-content';
        const mockPackage = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        const mockResponse = {
            status: 200,
            body: null,
            type: 4,
            clone: null,
            headers: null,
            statusText: 'OK',
            url: `localhost:9000/package/${mockPackageId}`,
            ok: false
        };
        // Action
        spyOn(apiService, 'packageRetrieve$Response').and.returnValue((0, rxjs_1.of)(mockResponse));
        component.packageId = mockPackageId;
        component.packageData = mockPackage;
        component.getPackage();
        // Assert
        expect(apiService.packageRetrieve$Response).toHaveBeenCalled();
        expect(apiService.packageRetrieve$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.packageData).toEqual(mockPackage);
        backend.verify();
    }));
    // Negative Test Case: Download Package Unsuccessfully Invalid ID
    it('should expect HTTP response to download package to be 404 for well-formed query with non-existing package ID', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-invalid-id';
        const mockZipContent = '';
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        component.packageId = mockPackageId;
        component.getPackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('GET');
        req.flush({ Content: mockZipContent }, { status: 404, statusText: 'Not Found' });
        // Assert
        expect(component.packageData).toEqual(mockResponse);
        backend.verify();
    }));
    // Negative Test Case: Download Package Unsuccessfully Invalid Request
    it('should expect HTTP response to download package to be 400 for mal-formed query', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = '';
        const mockZipContent = '';
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        component.getPackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('GET');
        req.flush({ Content: mockZipContent }, { status: 400, statusText: 'Bad Request' });
        expect(component.packageData).toEqual(mockResponse);
        backend.verify();
    }));
    //
    // Update Package Tests (Package Operations)
    //
    // Positive Test Case: Update Package Successfully
    it('should expect HTTP response to update package to be 200 for well-formed query with package zip file', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'mock-package-content';
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.packageId = mockPackageId;
        component.packageData = mockResponse;
        component.updatePackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('PUT');
        req.flush({ Content: mockZipContent }, { status: 200, statusText: 'OK' });
        expect(component.packageData).toEqual(mockResponse);
        expect(component.updateMessage).toEqual('Package update successful');
        backend.verify();
    }));
    it('should expect HTTP response to upload package to be 200 for well-formed query test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockPackage = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        // Action
        spyOn(apiService, 'packageUpdate$Response').and.returnValue((0, rxjs_1.of)({ body: mockResponse, status: 200 }));
        component.packageData = mockPackage;
        component.updatePackage();
        // Assert
        expect(apiService.packageUpdate$Response).toHaveBeenCalled();
        expect(apiService.packageUpdate$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader, body: mockPackage }, undefined);
        expect(component.packageData).toEqual(mockResponse);
        httpTestingController.verify();
    }));
    // Negative Test Case: Update Package Unsuccessfully
    it('should expect HTTP response to update package to be 200 for well-formed query with package zip file', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'mock-package-content';
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.packageId = mockPackageId;
        component.packageData = mockResponse;
        component.updatePackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('PUT');
        req.flush({ Content: mockZipContent }, { status: 400, statusText: 'Bad Request' });
        expect(component.packageData).toEqual(mockResponse);
        expect(component.updateMessage).toEqual('Error updating package');
        backend.verify();
    }));
    // Negative Test Case: Malformed API query with both Content and URL fields set
    it('should handle malformed query and respond with 400 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        service.packageUpdate({
            'X-Authorization': component.authHeader,
            id: 'mock-valid-id',
            body: null
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
            url: 'http://localhost:9000/package/mock-valid-id',
            method: 'PUT',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    // Negative Test Case:  API query with both Content and URL fields set
    it('should handle well-formed query with incorrect fields and respond with 400 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        const mockPackage = {
            data: { Content: 'invalid-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        service.packageUpdate({
            'X-Authorization': component.authHeader,
            id: 'mock-valid-id',
            body: mockPackage
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
            url: 'http://localhost:9000/package/mock-valid-id',
            method: 'PUT',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to update package to be 400 for well-formed query with package invalid zip file', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'invalid-package-content';
        const mockResponse = {
            data: { Content: 'invalid-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.packageId = mockPackageId;
        component.packageData = mockResponse;
        component.updatePackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('PUT');
        req.flush({ Content: mockZipContent }, { status: 400, statusText: 'Bad Request' });
        expect(component.packageData).toEqual(mockResponse);
        expect(component.updateMessage).toEqual('Error updating package');
        backend.verify();
    }));
    // Negative Test Case:  API query with already existing  package
    it('should handle well-formed query with already existing package 409 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        const mockPackage = {
            data: { Content: 'existing-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        service.packageUpdate({
            'X-Authorization': component.authHeader,
            id: 'mock-valid-id',
            body: mockPackage
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 400 response
        (error) => {
            expect(error.status).toEqual(409);
            expect(error.statusText).toEqual('Bad Request');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: 'http://localhost:9000/package/mock-valid-id',
            method: 'PUT',
        });
        // Respond to the request with a mock response and status 400
        req.flush('Bad Request', { status: 409, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to update package to be 409 for well-formed query with package existing zip file', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'existing-package-content';
        const mockResponse = {
            data: { Content: 'existing-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.packageId = mockPackageId;
        component.packageData = mockResponse;
        component.updatePackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('PUT');
        req.flush({ Content: mockZipContent }, { status: 409, statusText: 'Bad Request' });
        expect(component.packageData).toEqual(mockResponse);
        expect(component.updateMessage).toEqual('Error updating package');
        backend.verify();
    }));
    //
    // Delete Package Tests (Package Operations)
    //
    // Positive Test Case: Delete Package Successfully
    it('should expect HTTP response to update package to be 200 for well-formed query', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        const mockPackageId = 'mock-valid-id';
        const mockZipContent = 'mock-package-content';
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        component.deletePackageId = mockPackageId;
        component.packageData = mockResponse;
        component.deletePackage();
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ Content: mockZipContent }, { status: 200, statusText: 'OK' });
        expect(component.packageData).toEqual(mockResponse);
        expect(component.deleteMessage).toEqual('Package deletion successful');
        backend.verify();
    }));
    it('should expect HTTP response to delete package to be 200 for well-formed query test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockPackage = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        const mockResponse = {
            data: { Content: 'mock-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-valid-id' }
        };
        // Action
        spyOn(apiService, 'packageDelete$Response').and.returnValue((0, rxjs_1.of)({ body: mockResponse, status: 200 }));
        component.deletePackageId = mockPackageId;
        component.packageData = mockPackage;
        component.deletePackage();
        // Assert
        expect(apiService.packageDelete$Response).toHaveBeenCalled();
        expect(apiService.packageDelete$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.deleteMessage).toEqual('Package deletion successful');
        httpTestingController.verify();
    }));
    it('should handle well-formed query with non existing package 404 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        const mockPackage = {
            data: { Content: 'invalid-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-invalid-id' }
        };
        service.packageDelete({
            'X-Authorization': component.authHeader,
            id: 'mock-invalid-id',
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 400 response
        (error) => {
            expect(error.status).toEqual(404);
            expect(error.statusText).toEqual('Not Found');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: 'http://localhost:9000/package/mock-invalid-id',
            method: 'DELETE',
        });
        // Respond to the request with a mock response and status 404
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to delete package to be 404 for well-formed query test invalid 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-invalid-id';
        const mockPackage = {
            data: { Content: 'invalid-package-content', URL: '', JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: 'mock-invalid-id' }
        };
        // Action
        spyOn(apiService, 'packageDelete$Response').and.returnValue((0, rxjs_1.of)({ body: mockPackage, status: 404 }));
        component.deletePackageId = mockPackageId;
        component.packageData = mockPackage;
        component.deletePackage();
        // Assert
        expect(apiService.packageDelete$Response).toHaveBeenCalled();
        expect(apiService.packageDelete$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.deleteMessage).toEqual('Package deletion successful');
        httpTestingController.verify();
    }));
    // Negative Test Case: Delete Package Unsuccessfully Mal-formed API Query
    it('should handle mal-formed query with 404 status code', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Trigger the HTTP request with a malformed query
        const mockPackage = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        service.packageDelete({
            'X-Authorization': component.authHeader,
            id: '',
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
            url: 'http://localhost:9000/package/',
            method: 'DELETE',
        });
        // Respond to the request with a mock response and status 404
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to delete package to be 400 for mal-formed query 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-valid-id'; // Set a valid package ID
        const mockPackage = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        component.deletePackageId = mockPackageId; // Set the deletePackageId property
        // Action
        spyOn(apiService, 'packageDelete$Response').and.returnValue((0, rxjs_1.throwError)({ status: 400 }));
        component.deletePackage();
        // Assert
        expect(apiService.packageDelete$Response).toHaveBeenCalled();
        expect(apiService.packageDelete$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.deleteMessage).toEqual('Error deleting package');
        httpTestingController.verify();
    }));
    //
    // Rate Package Tests
    //
    // Positive Test Case: Rate Package Successfully
    it('should expect HTTP response to rate package to be 200 for well-formed query', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockRating = {
            BusFactor: 0.2,
            Correctness: 0.1,
            GoodPinningPractice: 0.1,
            LicenseScore: 0,
            NetScore: 0.8,
            PullRequest: 0,
            RampUp: 0.3,
            ResponsiveMaintainer: 0.1
        };
        component.ratePackageId = mockPackageId;
        //component.ratePackageResponse = mockRating;
        // Act
        component.ratePackage();
        // Assert
        const req = httpTestingController.expectOne(`http://localhost:9000/package/${mockPackageId}/rate`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRating, { status: 200, statusText: 'OK' });
        expect(component.ratePackageResponse).toEqual(mockRating);
        backend.verify();
    }));
    it('should expect HTTP response to rate package to be 200 for well-formed query test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockRating = {
            BusFactor: 0.2,
            Correctness: 0.1,
            GoodPinningPractice: 0.1,
            LicenseScore: 0,
            NetScore: 0.8,
            PullRequest: 0,
            RampUp: 0.3,
            ResponsiveMaintainer: 0.1
        };
        // Action
        spyOn(apiService, 'packageRate$Response').and.returnValue((0, rxjs_1.of)({ body: mockRating, status: 200 }));
        component.ratePackageId = mockPackageId;
        component.ratePackageResponse = mockRating;
        component.ratePackage();
        // Assert
        expect(apiService.packageRate$Response).toHaveBeenCalled();
        expect(apiService.packageRate$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.ratePackageResponse).toEqual(mockRating);
        httpTestingController.verify();
    }));
    // Negative Test Case: Rate Package Unsuccessfully
    it('should expect HTTP response to rate package to be 404 for well-formed query to non-existing package', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = 'mock-invalid-id';
        component.ratePackageId = mockPackageId;
        // Act
        service.packageRate({
            'X-Authorization': component.authHeader,
            id: 'mock-invalid-id',
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 400 response
        (error) => {
            expect(error.status).toEqual(404);
            expect(error.statusText).toEqual('Not Found');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: `http://localhost:9000/package/${mockPackageId}/rate`,
            method: 'GET',
        });
        // Respond to the request with a mock response and status 404
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to rate package to be 404 for well-formed query to invalid package 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-invalid-id';
        const mockRating = {
            BusFactor: 0,
            Correctness: 0,
            GoodPinningPractice: 0,
            LicenseScore: 0,
            NetScore: 0,
            PullRequest: 0,
            RampUp: 0,
            ResponsiveMaintainer: 0
        };
        // Action
        spyOn(apiService, 'packageRate$Response').and.returnValue((0, rxjs_1.throwError)({ status: 404 }));
        component.ratePackageId = mockPackageId;
        component.ratePackage();
        // Assert
        expect(apiService.packageRate$Response).toHaveBeenCalled();
        expect(apiService.packageRate$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.ratePackageResponse).toEqual(mockRating);
        httpTestingController.verify();
    }));
    // Negative Test Case: Rate Package Unsuccessfully
    it('should expect HTTP response to rate package to be 400 for mal-formed query', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = '';
        component.ratePackageId = mockPackageId;
        // Act
        service.packageRate({
            'X-Authorization': component.authHeader,
            id: `${mockPackageId}`,
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
            url: `http://localhost:9000/package/${mockPackageId}/rate`,
            method: 'GET',
        });
        // Respond to the request with a mock response and status 404
        req.flush('Bad Request Found', { status: 400, statusText: 'Bad Request' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to rate package to be 400 for mal-formed query test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = '';
        const mockRating = {
            BusFactor: 0,
            Correctness: 0,
            GoodPinningPractice: 0,
            LicenseScore: 0,
            NetScore: 0,
            PullRequest: 0,
            RampUp: 0,
            ResponsiveMaintainer: 0
        };
        // Action
        spyOn(apiService, 'packageRate$Response').and.returnValue((0, rxjs_1.throwError)({ status: 400 }));
        component.ratePackageId = mockPackageId;
        component.ratePackage();
        // Assert
        expect(apiService.packageRate$Response).toHaveBeenCalled();
        expect(apiService.packageRate$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.ratePackageResponse).toEqual(mockRating);
        httpTestingController.verify();
    }));
    // Negative Test Case: Rate Package Unsuccessfully
    it('should expect HTTP response to rate package to be 500 for well-formed query that takes 15+ seconds', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = 'mock-id';
        component.ratePackageId = mockPackageId;
        // Trigger the HTTP request with a query that will return too many packages
        service.packageRate({
            'X-Authorization': component.authHeader,
            id: mockPackageId,
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 500 response
        (error) => {
            expect(error.status).toEqual(500);
            expect(error.statusText).toEqual('Request Entity Too Large');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: `http://localhost:9000/package/${mockPackageId}/rate`,
            method: 'GET',
        });
        // Respond to the request with a mock response and status 413
        req.flush('Request Entity Too Large', { status: 500, statusText: 'Request Entity Too Large' });
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to rate package to be 500 for well-formed query 15+ seconds test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-id';
        const mockRating = {
            BusFactor: 0,
            Correctness: 0,
            GoodPinningPractice: 0,
            LicenseScore: 0,
            NetScore: 0,
            PullRequest: 0,
            RampUp: 0,
            ResponsiveMaintainer: 0
        };
        // Action
        spyOn(apiService, 'packageRate$Response').and.returnValue((0, rxjs_1.throwError)({ status: 500 }));
        component.ratePackageId = mockPackageId;
        component.ratePackage();
        // Assert
        expect(apiService.packageRate$Response).toHaveBeenCalled();
        expect(apiService.packageRate$Response).toHaveBeenCalledWith({ id: mockPackageId, 'X-Authorization': component.authHeader }, undefined);
        expect(component.ratePackageResponse).toEqual(mockRating);
        httpTestingController.verify();
    }));
    //
    // Create New Package Tests
    //
    // Positive Test Case: Create Package Successfully
    it('should expect HTTP response to create package to be 200 for well-formed query with valid URL', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockURL = 'http://valid-package-url.com';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: 'mock-content', URL: mockURL, JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: mockPackageId }
        };
        // Act
        component.postPackageData = mockPackage;
        component.putPackage();
        // Assert
        const req = httpTestingController.expectOne(`http://localhost:9000/package`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse, { status: 200, statusText: 'OK' });
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        backend.verify();
    }));
    it('should expect HTTP response to create package to be 200 for well-formed query test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockPackageId = 'mock-valid-id';
        const mockURL = 'http://valid-package-url.com';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: 'mock-content', URL: mockURL, JSProgram: '' },
            metadata: { Name: 'mock-package', Version: '1.0.0', ID: mockPackageId }
        };
        // Action
        spyOn(apiService, 'packageCreate$Response').and.returnValue((0, rxjs_1.of)({ body: mockResponse, status: 200 }));
        component.postPackageData = mockPackage;
        component.putPackage();
        // Assert
        expect(apiService.packageCreate$Response).toHaveBeenCalled();
        expect(apiService.packageCreate$Response).toHaveBeenCalledWith({ body: mockPackage, 'X-Authorization': component.authHeader }, undefined);
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        httpTestingController.verify();
    }));
    // Negative Test Case: Create Package Unsuccessfully (low quality URL)
    it('should expect HTTP response to create package to be 424 for well-formed query with low-quality URL', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockURL = 'http://invalid-package-url.com';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        // Act
        component.postPackageData = mockPackage;
        // Trigger the HTTP request with a query that will return too many packages
        service.packageCreate({
            'X-Authorization': component.authHeader,
            body: mockPackage,
        }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'), 
        // The error callback should be invoked with a 424 response
        (error) => {
            expect(error.status).toEqual(424);
            expect(error.statusText).toEqual('Invalid Entry');
        });
        // Expect a single request to a specific URL with specific headers and body
        const req = backend.expectOne({
            url: `http://localhost:9000/package`,
            method: 'POST',
        });
        // Respond to the request with a mock response and status 413
        req.flush('Invalid Entry', { status: 424, statusText: 'Invalid Entry' });
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to create package to be 424 for well-formed query with low-quality URL test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockURL = 'http://invalid-package-url.com';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        // Act
        component.postPackageData = mockPackage;
        // Action
        spyOn(apiService, 'packageCreate$Response').and.returnValue((0, rxjs_1.throwError)({ status: 424 }));
        component.putPackage();
        // Assert
        expect(apiService.packageCreate$Response).toHaveBeenCalled();
        expect(apiService.packageCreate$Response).toHaveBeenCalledWith({ body: mockPackage, 'X-Authorization': component.authHeader }, undefined);
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        httpTestingController.verify();
    }));
    // Negative Test Case: Create Package Unsuccessfully (invalid URL)
    it('should expect HTTP response to create package to be 400 for well-formed query with invalid URL', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (service, backend) => {
        // Arrange
        const mockURL = '';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        // Act
        component.postPackageData = mockPackage;
        // Trigger the HTTP request with a query that will return too many packages
        service.packageCreate({
            'X-Authorization': component.authHeader,
            body: mockPackage,
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
            url: `http://localhost:9000/package`,
            method: 'POST',
        });
        // Respond to the request with a mock response and status 413
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        // Ensure there are no outstanding requests
        backend.verify();
    }));
    it('should expect HTTP response to create package to be 400 for well-formed query with invalid URL test 2', (0, testing_1.inject)([services_1.ApiService, testing_2.HttpTestingController], (apiService, httpTestingController) => {
        // Arrange
        const mockURL = '';
        const mockPackage = {
            Content: 'mock-content', URL: mockURL, JSProgram: ''
        };
        const mockResponse = {
            data: { Content: '', URL: '', JSProgram: '' },
            metadata: { Name: '', Version: '', ID: '' }
        };
        // Act
        component.postPackageData = mockPackage;
        // Action
        spyOn(apiService, 'packageCreate$Response').and.returnValue((0, rxjs_1.throwError)({ status: 400 }));
        component.putPackage();
        // Assert
        expect(apiService.packageCreate$Response).toHaveBeenCalled();
        expect(apiService.packageCreate$Response).toHaveBeenCalledWith({ body: mockPackage, 'X-Authorization': component.authHeader }, undefined);
        expect(component.postPackageDataResponse).toEqual(mockResponse);
        httpTestingController.verify();
    }));
});
