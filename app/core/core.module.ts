import { NgModule, ErrorHandler } from "@angular/core";
import { Http, XHRBackend, RequestOptions } from "@angular/http";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";

// Shared Services
import { CustomHttpService } from "./custom-http.service";
import { CommonErrorService } from "./common-error.service";
import { ErrorNotifierService } from "./error-notifier";
import { SnackbarMessageService } from "./snackbar-message.service";
import { ValidationService } from "./services/validation.service";
import { AuthGuard } from "./services/auth-guard.service";

// Shared Storage
import { AuthStore } from "./storage/auth-storage";

// Added for AOT compilation
export function httpFactory(http: Http,errorNotifier: ErrorNotifierService, authStore: AuthStore) {
    return new CustomHttpService(http, errorNotifier, authStore);
}

@NgModule({
    imports: [NativeScriptModule],
    providers: [
        AuthStore,
        { provide: ErrorHandler, useClass: CommonErrorService },
        ErrorNotifierService,
        {
            provide: CustomHttpService,
            useFactory: httpFactory,
            deps: [Http, ErrorNotifierService, AuthStore]
        },
        SnackbarMessageService,
        AuthGuard,
        ValidationService
    ]
})
export class CoreModule { }