import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { DirectiveModule } from "../../core/directive/directive.module";

import { UpdateInterestPointService } from "./shared/update-interest-point.service";

import { UpdateInterestPointComponent } from "./update-interest-point.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: UpdateInterestPointComponent, canActivate:[AuthGuard] }
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
        UpdateInterestPointService
    ],
    declarations: [
        UpdateInterestPointComponent
    ]
})
export class UpdateInterestPointModule { }