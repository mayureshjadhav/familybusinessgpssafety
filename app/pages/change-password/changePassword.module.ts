import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { ChangePasswordComponent } from "./changePassword.component";

import { ChangePasswordService } from "./shared/changePassword.service";

import { CoreModule } from "../../core/core.module";

export const routes = [
    { path: "", component: ChangePasswordComponent },
];


@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptFormsModule,
        NativeScriptRouterModule.forChild(routes),
        ReactiveFormsModule,
        CoreModule
    ],
    providers: [
        ChangePasswordService
    ],
    declarations: [ChangePasswordComponent]
})
export class ChangePasswordModule {

}
