/*
 * File: home.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the home endpoint for the front-end
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../api/services';
import { PackageModule } from '../package/package.module';
import { PackagesModule } from '../packages/packages.module';
import { PackagebyNameModule } from '../packageby-name/packageby-name.module';
import { PackagebyRegexModule } from '../packageby-regex/packageby-regex.module';
import { ResetModule } from '../reset/reset.module';

describe('HomeComponent', () => {
	let component: HomeComponent;
	let fixture: ComponentFixture<HomeComponent>;
	let apiService: ApiService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [HomeComponent],
			imports: [
				HttpClientTestingModule,
				PackageModule,
				PackagesModule,
				PackagebyNameModule,
				PackagebyRegexModule,
				ResetModule,
			],
			providers: [{ provide: ApiService }],
		}).compileComponents();

		fixture = TestBed.createComponent(HomeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		apiService = TestBed.inject(ApiService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	// Initial Test Case: Home Component Created
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
