import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { NavigationExtras } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";

import { AuthStore } from "./storage/auth-storage";

@Injectable()
export class CommonErrorService implements ErrorHandler {
    routerExtensions: RouterExtensions;

    authStore: AuthStore;

    constructor(private injector: Injector) { }

    handleError(error) {
        // do something with the exception
        console.log("Error Message : " + error);

        this.authStore = this.injector.get(AuthStore);

        // Remove values from application settings
        this.authStore.remove();


        let navigationExtras = {
            "error": error
        };
        this.routerExtensions = this.injector.get(RouterExtensions);
        this.routerExtensions.navigate(["error"], {
            transition: {
                name: "slideLeft"
            },
            queryParams: navigationExtras
        });
    }
}