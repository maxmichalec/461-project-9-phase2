// home.module.ts
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageModule } from '../package/package.module';
import { PackagesModule } from '../packages/packages.module';
import { PackagebyNameModule } from '../packageby-name/packageby-name.module';
import { PackagebyRegexModule } from '../packageby-regex/packageby-regex.module';
import { ResetModule } from '../reset/reset.module';

@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    PackageModule,
    PackagesModule,
    PackagebyNameModule,
    PackagebyRegexModule,
    ResetModule,
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent],
  bootstrap: [HomeComponent],
})
export class HomeModule {}

  