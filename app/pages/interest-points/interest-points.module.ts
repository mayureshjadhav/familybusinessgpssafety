import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { TabsService } from "./shared/tabs.service";
import { InterestPointsService } from "./shared/interest-points.service";

import { PipeModule } from "../../core/pipe/pipe.module";

import { InterestPointsComponent } from "./interest-points.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: InterestPointsComponent, canActivate:[AuthGuard] }
    //{ path: "", component: GroupMembersComponent}
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
        TabsService,
        InterestPointsService
    ],
    declarations: [
        InterestPointsComponent
    ]
})
export class InterestPointsModule { }