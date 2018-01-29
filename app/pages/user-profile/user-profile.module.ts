import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { DirectiveModule } from "../../core/directive/directive.module";

import { PipeModule } from "../../core/pipe/pipe.module";

import { UserProfileComponent } from "./user-profile.component";
import { UserProfileService } from "./shared/user-profile.service";

import { AuthGuard } from "../../core/services/auth-guard.service";

//import { TNSFontIconModule } from "nativescript-ngx-fonticon";


export const routes = [
    { path: "", component: UserProfileComponent, canActivate:[AuthGuard] },
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
        PipeModule
        //TNSFontIconModule.forRoot(FontCss)
    ],
    providers: [
        UserProfileService
    ],
    declarations: [UserProfileComponent]
})
export class UserProfileModule {


}
