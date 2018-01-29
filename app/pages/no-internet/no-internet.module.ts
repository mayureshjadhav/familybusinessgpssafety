import { NgModule,NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NoInternetComponent } from "./no-internet.component";

export const routes = [
    { path: "", component: NoInternetComponent},     
];


@NgModule({
       schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild(routes),
    ],
    declarations: [NoInternetComponent]
})
export class NoInternetModule {  
 }
