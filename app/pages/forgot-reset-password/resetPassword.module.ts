import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { ResetPasswordComponent } from "./resetPassword.component";

import { ResetPasswordService } from "./shared/resetPassword.service";

import { DirectiveModule } from "../../core/directive/directive.module";

export const routes = [
    { path: "", component: ResetPasswordComponent },
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
        ResetPasswordService
    ],
    declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule {
}
