import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './UI/button/button.component';
import { ErrorMessageComponent } from './UI/error-message/error-message.component';
import { FormLabelComponent } from './UI/form-label/form-label.component';
import { IconComponent } from './UI/icon/icon.component';
import { LoaderComponent } from './UI/loader/loader.component';
import { NoInternetScreenComponent } from './UI/no-internet-screen/no-internet-screen.component';
import { TitleComponent } from './UI/title/title.component';
import { DialogComponent } from './UI/dialog/dialog.component';
import { PageBreadcrumbComponent } from './UI/page-breadcrumb/page-breadcrumb.component';
import { GenericTableComponent } from './UI/generic-table/generic-table.component';
import { FormInputComponent } from './UI/form-input/form-input.component';
import { FormSelectComponent } from './UI/form-select/form-select.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    ErrorMessageComponent,
    FormLabelComponent,
    TitleComponent,
    IconComponent,
    LoaderComponent,
    NoInternetScreenComponent,
    DialogComponent,
    PageBreadcrumbComponent,
    GenericTableComponent,
    FormInputComponent,
    FormSelectComponent
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ErrorMessageComponent,
    FormLabelComponent,
    TitleComponent,
    IconComponent,
    LoaderComponent,
    NoInternetScreenComponent,
    DialogComponent,
    PageBreadcrumbComponent,
    GenericTableComponent,
    FormInputComponent,
    FormSelectComponent
  ],
})
export class SharedModule { }
