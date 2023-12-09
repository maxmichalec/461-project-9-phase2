"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * File: reset.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the reset endpoint for the front-end
 */
const testing_1 = require("@angular/core/testing");
const testing_2 = require("@angular/common/http/testing");
const rxjs_1 = require("rxjs");
const reset_component_1 = require("./reset.component");
const services_1 = require("../api/services");
describe('ResetComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [reset_component_1.ResetComponent],
            imports: [testing_2.HttpClientTestingModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(reset_component_1.ResetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        apiService = testing_1.TestBed.inject(services_1.ApiService);
        httpTestingController = testing_1.TestBed.inject(testing_2.HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });
    // Initial Test Case: Reset Component Created
    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.resetMessage).toEqual('');
    });
    // Positive Test Case: Reset System Successfully
    it('should reset application on valid query', () => {
        const mockResponse = {
            status: 200,
            body: null,
            type: 4,
            clone: null,
            headers: null,
            statusText: 'OK',
            url: 'localhost:9000/reset',
            ok: true
        };
        spyOn(apiService, 'registryReset$Response').and.returnValue((0, rxjs_1.of)(mockResponse));
        component.onSubmit();
        expect(apiService.registryReset$Response).toHaveBeenCalled();
        expect(apiService.registryReset$Response).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader }, undefined);
        expect(component.resetMessage).toEqual('Application reset successful.');
    });
    // Negative Test Case: Reset System Unsuccessfully
    it('should not reset application on invalid query', () => {
        const mockErrorResponse = {
            status: 400,
            body: null,
            type: 4,
            clone: null,
            headers: null,
            statusText: 'Bad Request',
            url: 'localhost:9000/reset',
            ok: false
        };
        spyOn(apiService, 'registryReset$Response').and.returnValue((0, rxjs_1.throwError)({ error: mockErrorResponse }));
        component.onSubmit();
        expect(apiService.registryReset$Response).toHaveBeenCalled();
        expect(apiService.registryReset$Response).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader }, undefined);
        expect(component.resetMessage).toEqual('Error reseting application.');
    });
    //
    // Redundant tests to ensure 100% coverage and try different ways to test
    //
    it('should call apiService.registryReset on submit', () => {
        spyOn(apiService, 'registryReset').and.returnValue((0, rxjs_1.of)());
        component.onSubmit();
        expect(apiService.registryReset).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader });
    });
    it("should handle well-formed API query to /reset with 200 response", () => {
        // Arrange
        const responseMock = {
            status: 200,
            body: null,
            type: null,
            clone: null,
            headers: null,
            statusText: null,
            url: null,
            ok: true
        };
        // Spy on the actual method
        spyOn(apiService, 'registryReset$Response').and.returnValue((0, rxjs_1.of)(responseMock));
        // Act
        component.onSubmit();
        // Assert
        expect(apiService.registryReset$Response).toHaveBeenCalled();
        expect(component.resetMessage).toEqual('Application reset successful.');
    });
    it('Should handle well-formed API query', () => {
        const expectedResponse = {
            headers: null,
            status: 200,
            statusText: 'OK',
            url: 'http://localhost:9000/reset',
            ok: true,
            type: 4,
            body: null,
            clone: null
        };
        apiService.registryReset$Response({ 'X-Authorization': component.authHeader }).subscribe((response) => {
            // console.log('expectedResponse: ', expectedResponse);
            expect(response.status).toEqual(expectedResponse.status);
        });
        const req = httpTestingController.expectOne('http://localhost:9000/reset');
        req.flush(expectedResponse);
    });
    it('Should handle mal-formed API query', () => {
        component.onSubmit();
        const req = httpTestingController.expectOne('http://localhost:9000/reset');
        req.flush(null, { status: 400, statusText: 'Bad Request' });
        expect(component.resetMessage).toEqual('Error reseting application.');
        console.log('component.resetMessage: ', component.resetMessage);
    });
    it('Should handle API query with no auth header', () => {
        component.authHeader = '';
        component.onSubmit();
        const req = httpTestingController.expectOne('http://localhost:9000/reset');
        req.flush(null, { status: 400, statusText: 'Unauthorized' });
        expect(component.resetMessage).toEqual('Error reseting application.');
        console.log('component.resetMessage for no auth: ', component.resetMessage);
    });
    it('Should handle API with correct auth header', () => {
        component.authHeader = 'X-Authorization';
        component.onSubmit();
        const req = httpTestingController.expectOne('http://localhost:9000/reset');
        req.flush(null, { status: 200, statusText: 'OK' });
        expect(component.resetMessage).toEqual('Application reset successful.');
        console.log('component.resetMessage for correct auth: ', component.resetMessage);
    });
});
