/*
 * File: app.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the app endpoint for the front-end
 */
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ApiService } from "./api/services";


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, 
      HttpClientTestingModule,
      HomeModule],
    declarations: [AppComponent],
    providers: [{provide: ApiService}]
  }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
});

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Package Registry'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const expectedTitle = 'Package Registry'
    expect(app.title).toEqual(expectedTitle);
  });

});
