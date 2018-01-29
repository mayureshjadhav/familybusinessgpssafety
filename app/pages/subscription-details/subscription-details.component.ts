import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";
import { TNSFancyAlert } from "nativescript-fancyalert";

import { alert } from "ui/dialogs";
import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { SubscriptionDetailsService } from "./shared/subscription-details.service";

import { SubscriptionModel } from "./shared/subscription-details.model";

import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-subscription-details",
    moduleId: module.id,
    templateUrl: "./subscription-details.component.html"
})

export class SubscriptionDetailsComponent implements OnInit, AfterContentInit, OnDestroy {

    groupId: string;
    item: SubscriptionModel;
    isOwer: boolean = false;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private subscriptionService: SubscriptionDetailsService, private route: ActivatedRoute,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService) {

        this.item = new SubscriptionModel();

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.errorHandler();
    }

    ngAfterContentInit() {
        this.renderViewTimeout = setTimeout(() => {
            this.isLoad = false;
        }, 300);
    }

    ngOnDestroy() {
        clearTimeout(this.renderViewTimeout);
    }

    ngOnInit() {
        if (isAndroid) {
            // prevent the soft keyboard from showing initially when textfields are present
            app.android.startActivity.getWindow().setSoftInputMode(
                android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
        }
        this.getSubscriptionDetails(this.groupId);
    }

    getSubscriptionDetails(groupId) {
        // Show Loading
        this.isLoadingView(true);
        this.subscriptionService.get(groupId).subscribe((response) => {

            console.log("Group Details : " + JSON.stringify(response));

            this.item = response;
            // hide Loading
            this.isLoadingView(false);
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    errorMsg(error) {
        // Show error                
        if (isJson(error)) {
            if (error.Message == "UserProfile_NOT_COMPLETE") {
                this.routerExtensions.navigate(["user-profile"], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            } else {
                if (error.Message == "GROUP_DOES_NOT_EXIST") {
                    this.snackbarService.info("Group does not exists");
                    this.routerExtensions.navigate([""], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                } else {
                    TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
                }
            }
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage();
    }

    public onUpgradTab() {
        this.routerExtensions.navigate(["upgrade-subscription", this.groupId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    errorHandler() {
        this.errorNotifier.onError(err => {
            console.log("Handle Error " + JSON.stringify(err));
            this.isLoading = false;
            if (err.status === 401) {
                this.snackbarService.info("Not Authorized");
                this.routerExtensions.navigate(["login"], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            }
            else if (err.status === 101) {
                alert({
                    title: "Notice",
                    message: err.message,
                    okButtonText: "Okay"
                }).then(function () {
                    console.log("Dialog closed!");
                });
            }
            else if (err.status === 102) {
                this.snackbarService.info(err.message);
            }
            else {
                if (err.error == "invalid_grant") {
                    this.routerExtensions.navigate(["login"], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                } else {
                    this.snackbarService.info("No internet connection found!");
                }
            }
        });
    }

    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
    }
}