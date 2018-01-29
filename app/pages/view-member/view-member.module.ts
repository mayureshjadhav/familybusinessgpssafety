import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ViewMemberService } from "./shared/view-member.service";

import { ViewMemberComponent } from "./view-member.component";
import { PipeModule } from "../../core/pipe/pipe.module";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: ViewMemberComponent, canActivate:[AuthGuard] }
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
        ViewMemberService
    ],
    declarations: [
        ViewMemberComponent
    ]
})
export class ViewMemberModule { }