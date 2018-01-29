import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
//import { TNSFontIconModule } from "nativescript-ngx-fonticon";

import { UpdateGroupService } from "./shared/update-group.service";

import { UpdateGroupComponent } from "./update-group.component";
import { DirectiveModule } from "../../core/directive/directive.module";

import { AuthGuard } from '../../core/services/auth-guard.service';

export const routes = [
    //{ path: "", component: HomeComponent, canActivate:[AuthGuard] },
    { path: "", component: UpdateGroupComponent, canActivate:[AuthGuard] },
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
    providers: [
        UpdateGroupService
    ],
    declarations: [UpdateGroupComponent]
})
export class UpdateGroupModule {
}
