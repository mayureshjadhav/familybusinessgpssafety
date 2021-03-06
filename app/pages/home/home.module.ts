import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
//import { TNSFontIconModule } from "nativescript-ngx-fonticon";

import { HomeComponent } from "./home.component";

import { AuthGuard } from '../../core/services/auth-guard.service';
import { HomeService } from "./shared/home.service";

import { SharedModule } from "../../shared/shared.module";

export const routes = [
    { path: "", component: HomeComponent, canActivate:[AuthGuard] },
    //{ path: "", component: HomeComponent },
];

// // Added for AOT compilation
// export function FontCss() {
//     return {
//         'fa': './fontawesome.css'
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
        SharedModule
        //TNSFontIconModule.forRoot(FontCss)
    ],
    providers: [
        HomeService
    ],
    declarations: [HomeComponent]
})
export class HomeModule {
}
