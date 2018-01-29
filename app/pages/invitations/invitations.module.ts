import { NgModule, NO_ERRORS_SCHEMA, NgModuleFactoryLoader } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule, NSModuleFactoryLoader } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ModalDialogService } from "nativescript-angular/modal-dialog";

import { DirectiveModule } from "../../core/directive/directive.module";

import { InvitationsComponent } from "./invitations.component";
import { InvitationAcceptViewComponent } from "./shared/invitation-accept-view";

import { InvitationsService } from "./shared/invitations.service";

import { AuthGuard } from "../../core/services/auth-guard.service";

//import { TNSFontIconModule } from "nativescript-ngx-fonticon";


export const routes = [
    { path: "", component: InvitationsComponent, canActivate:[AuthGuard] },
    {
        path: "invitation-accept-modal",
        component: InvitationAcceptViewComponent,
        data: { title: "Problem Location Modal" }
    },
];

// // Added for AOT compilation
// export function FontCss() {
//     return {
//         'fa': 'fontawesome.css'
//     };
// }


@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptFormsModule,
        NativeScriptRouterModule.forChild(routes),
        ReactiveFormsModule,
        DirectiveModule,
        //TNSFontIconModule.forRoot(FontCss)
    ],
    entryComponents: [InvitationAcceptViewComponent ],
    providers: [
        InvitationsService,
        ModalDialogService,
        { provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader }
    ],
    declarations: [        
        InvitationsComponent,
        InvitationAcceptViewComponent
    ]
})
export class InvitationsModule {


}
