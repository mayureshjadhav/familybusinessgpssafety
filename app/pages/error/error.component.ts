import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";


@Component({
    selector: "tracker-error",
    moduleId: module.id,
    templateUrl: "./error.component.html"
})

export class ErrorComponent {

    errorText: string;

    isLoad = true;
    renderViewTimeout: any;

    /**
     * Creates an instance of ErrorComponent.
     * @param {Page} page 
     * @param {RouterExtensions} routerExtensions 
     * 
     * @memberOf NoInternetComponent
     */
    constructor(private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute) {
        //page.actionBarHidden = true;
        // Get the param
        this.routeParams.queryParams.subscribe((params) => {

            this.errorText = params["error"];
        });
    }
    
    ngAfterContentInit() {
        this.renderViewTimeout = setTimeout(() => {
            this.isLoad = false;
        }, 300);
    }

    ngOnDestroy() {
        clearTimeout(this.renderViewTimeout);
    }
    
    public onBackButtonTap() {
        this.routerExtensions.navigate([""], {
            clearHistory: true
        });
    }
}