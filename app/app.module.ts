import { NgModule, NO_ERRORS_SCHEMA, NgModuleFactoryLoader } from "@angular/core";
import { Http, XHRBackend, RequestOptions } from "@angular/http";
import { PreloadAllModules } from "@angular/router";

import { isAndroid, isIOS } from "platform";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptRouterModule, NSModuleFactoryLoader } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

/** App routing module */
import { AppRoutingModule } from "./app.routing";

import { AppComponent } from "./app.component";
import { CoreModule } from "./core/core.module";
//import { SharedModule } from "./shared/shared.module";

import { PlacePicker } from "nativescript-google-place-picker"

declare var GMSServices: any;

if (isIOS) { 
    GMSServices.provideAPIKey("AIzaSyB8XoP1O-5TTf47IBX7kmp2BXsyep1QIzo");
    PlacePicker.iosProvideAPIKey("AIzaSyB8XoP1O-5TTf47IBX7kmp2BXsyep1QIzo");
  }


@NgModule({
    declarations:
    [
        AppComponent
    ],
    bootstrap: [AppComponent],
    imports:
    [
        // Added for AOT compilation
        NativeScriptModule,
        NativeScriptFormsModule,
        NativeScriptHttpModule,
        AppRoutingModule,
        CoreModule
    ],
    providers: [{ provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader }],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
    constructor() {

    }
}
