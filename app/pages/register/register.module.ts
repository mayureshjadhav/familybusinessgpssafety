import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { DirectiveModule } from "../../core/directive/directive.module";

import { RegisterComponent } from "./register.component";
import { UserService } from "./shared/user.service";


export const routes = [
    { path: "", component: RegisterComponent },
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
        UserService
    ],
    declarations: [RegisterComponent]
})
export class RegisterModule {


}
