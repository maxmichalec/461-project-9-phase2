"use strict";
/*
 * File: home.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the home endpoint for the front-end
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for Home Component
const testing_1 = require("@angular/core/testing");
const home_component_1 = require("./home.component");
const testing_2 = require("@angular/common/http/testing");
const services_1 = require("../api/services");
describe('HomeComponent', () => {
    let component;
    let fixture;
    let apiService;
    let httpTestingController;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            declarations: [home_component_1.HomeComponent],
            imports: [testing_2.HttpClientTestingModule],
            providers: [{ provide: services_1.ApiService }]
        }).compileComponents();
        fixture = testing_1.TestBed.createComponent(home_component_1.HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        apiService = testing_1.TestBed.inject(services_1.ApiService);
        httpTestingController = testing_1.TestBed.inject(testing_2.HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });
    // Initial Test Case: Home Component Created
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
