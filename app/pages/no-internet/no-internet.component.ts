import { Component, ChangeDetectionStrategy } from "@angular/core";

import { RouterExtensions } from "nativescript-angular/router";

import { Page } from "ui/page";

import { NoInternetService } from "./shared/no-internet.service";

@Component({
    selector: "tracker-no-internet",
    moduleId: module.id,
    templateUrl: "./no-internet.component.html",
    providers: [NoInternetService],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoInternetComponent {

    IsOnlineResult = true;

   /**
    * Creates an instance of NoInternetComponent.
    * @param {Page} page 
    * @param {RouterExtensions} routerExtensions 
    * @param {NoInternetService} noInternetService 
    * 
    * @memberOf NoInternetComponent
    */
    constructor(page: Page, private routerExtensions: RouterExtensions, private noInternetService: NoInternetService) {
        page.actionBarHidden = true;
    }

    public tryAgain() {

        this.IsOnlineResult = this.noInternetService.checkConnection();
        console.log("Try again :" + this.IsOnlineResult);
        if (this.IsOnlineResult) {
            this.routerExtensions.backToPreviousPage();
        }
    }
}