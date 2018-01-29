import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { ForgotPasswordComponent } from "./forgotPassword.component";

import { ForgotPasswordService } from "./shared/forgotPassword.service";

import { DirectiveModule } from "../../core/directive/directive.module";

export const routes = [
    { path: "", component: ForgotPasswordComponent },
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
        ForgotPasswordService
    ],
    declarations: [ForgotPasswordComponent]
})
export class ForgotPasswordModule {
}
