import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { TabsService } from "./shared/tabs.service";
import { GroupMembersService } from "./shared/group-members.service";

import { PipeModule } from "../../core/pipe/pipe.module";

import { GroupMembersComponent } from "./group-members.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: GroupMembersComponent, canActivate:[AuthGuard] }
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
        GroupMembersService
    ],
    declarations: [
        GroupMembersComponent
    ]
})
export class GroupMembersModule { }