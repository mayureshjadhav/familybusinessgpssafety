import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ViewInterestPointService } from "./shared/view-interest-point.service";

import { ViewInterestPointComponent } from "./view-interest-point.component";
import { PipeModule } from "../../core/pipe/pipe.module";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: ViewInterestPointComponent, canActivate:[AuthGuard] }
];

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild(routerConfig),
        PipeModule
    ],
    providers: [
        ViewInterestPointService
    ],
    declarations: [
        ViewInterestPointComponent
    ]
})
export class ViewInterestPointModule { }