import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { LoginComponent } from "./login.component";

import { LoginService } from "./shared/login.service";

import { DirectiveModule } from "../../core/directive/directive.module";


export const routes = [
    { path: "", component: LoginComponent },
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
    declarations: [
        LoginComponent
    ],
    providers: [
        LoginService,
    ]
})
export class LoginModule {


}
