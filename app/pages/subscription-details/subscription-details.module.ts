import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SubscriptionDetailsService } from "./shared/subscription-details.service";

import { SubscriptionDetailsComponent } from "./subscription-details.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: SubscriptionDetailsComponent, canActivate:[AuthGuard] }
];

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild(routerConfig)
    ],
    providers: [
        SubscriptionDetailsService
    ],
    declarations: [
        SubscriptionDetailsComponent
    ]
})
export class SubscriptionDetailsModule { }