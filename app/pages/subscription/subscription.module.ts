import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
//import { TNSFontIconModule } from "nativescript-ngx-fonticon";

import { SubscriptionService } from "./shared/subscription.service";

import { SubscriptionComponent } from "./subscription.component";

import { AuthGuard } from '../../core/services/auth-guard.service';

export const routes = [
    //{ path: "", component: HomeComponent, canActivate:[AuthGuard] },
    { path: "", component: SubscriptionComponent, canActivate:[AuthGuard] },
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
        //TNSFontIconModule.forRoot(FontCss)
    ],
    providers: [
        SubscriptionService
    ],
    declarations: [SubscriptionComponent]
})
export class SubscriptionModule {
}
