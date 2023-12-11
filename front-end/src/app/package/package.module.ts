import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackageComponent } from './package.component';
import { FilterOutContentFieldPipe } from '../filter-out-content.pipe';

@NgModule({
	imports: [FormsModule, CommonModule],
	exports: [PackageComponent],
	declarations: [PackageComponent, FilterOutContentFieldPipe],
})
export class PackageModule {}
