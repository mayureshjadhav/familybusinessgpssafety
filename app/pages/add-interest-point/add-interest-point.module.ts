import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { DirectiveModule } from "../../core/directive/directive.module";

import { AddInterestPointService } from "./shared/add-interest-point.services";

import { AddInterestPointComponent } from "./add-interest-point.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: AddInterestPointComponent, canActivate:[AuthGuard] }
    //{ path: "", component: AddInterestPointComponent}
];

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptFormsModule,
        NativeScriptRouterModule.forChild(routerConfig),
        ReactiveFormsModule,
        DirectiveModule,
    ],
    providers: [
        AddInterestPointService
    ],
    declarations: [
        AddInterestPointComponent
    ]
})
export class AddInterestPointModule { }