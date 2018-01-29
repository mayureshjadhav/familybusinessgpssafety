import { NgModule,NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { ValidateRegistrationComponent } from "./validateRegistration.component";
import { ValidateRegistrationService } from "./shared/validateRegistration.service";

import { DirectiveModule } from "../../core/directive/directive.module";

export const routes = [
    { path: "", component: ValidateRegistrationComponent},     
];


@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptFormsModule,
        NativeScriptRouterModule.forChild(routes),
        ReactiveFormsModule,
        DirectiveModule
    ],
    providers: [
        ValidateRegistrationService
    ],
    declarations: [ValidateRegistrationComponent]
})
export class ValidateRegistrationModule {

  
 }
