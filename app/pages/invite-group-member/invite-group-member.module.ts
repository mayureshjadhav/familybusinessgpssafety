import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { DirectiveModule } from "../../core/directive/directive.module";

import { InviteGroupMemberService } from "./shared/invite-group-member.service";

import { InviteGroupMemberComponent } from "./invite-group-member.component";

import { AuthGuard } from "../../core/services/auth-guard.service";

export const routerConfig = [
    { path: "", component: InviteGroupMemberComponent, canActivate:[AuthGuard] }
    //{ path: "", component: GroupMembersComponent}
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
        InviteGroupMemberService
    ],
    declarations: [
        InviteGroupMemberComponent
    ]
})
export class InviteGroupMemberModule { }