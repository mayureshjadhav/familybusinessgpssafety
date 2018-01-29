import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { PlatformLocation } from "@angular/common";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";
//import { TNSFontIconService } from 'nativescript-ngx-fonticon';

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";
import { TabsService } from "../../shared/service/tabs.service";
import { HomeService } from "./shared/home.service";

import { AuthStore } from "../../core/storage/auth-storage";
import { Tab } from "../../shared/service/tabs.model";
import { GroupsdModel } from "./shared/home.model";


import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    providers: [
        TabsService]

})
export class HomeComponent implements OnInit, AfterContentInit, OnDestroy {

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    tabItems: Tab[] = [];

    groups: GroupsdModel[] = [];

    constructor(private formBuilder: FormBuilder, private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private route: ActivatedRoute,
        private routerExtensions: RouterExtensions, private authStore: AuthStore,
        private tabsService: TabsService,
        private homeService: HomeService,private location: PlatformLocation) {


        // this.route.params.subscribe((params) => {
        //     this.paramUserName = params["UserName"];
        //     // alert("paramUserName"  +this.paramUserName);
        // });

        // Get all tabs
        this.tabsService.getTabs().then((tabs) => {
            this.tabItems = tabs;
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
                console.log("Err: " +JSON.stringify(err));
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

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
    }

    ngOnInit() {
        if (isAndroid) {
            // prevent the soft keyboard from showing initially when textfields are present
            app.android.startActivity.getWindow().setSoftInputMode(
                android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
        }

        this.getAllGroups();
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
                TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
            }
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
    }

    refreshList(args) {
        console.log("Pull Refresh");
        var pullRefresh = args.object;
        this.getAllGroups();
        pullRefresh.refreshing = false;
   }

    getAllGroups() {
        // Show Loading
        this.isLoadingView(true);
        this.homeService.getAllGroups().subscribe((response) => {
            console.log("Groups : " + JSON.stringify(response));
            // Get All Groups
            this.groups = response;
            // Hide Loading
            this.isLoadingView(false);

        }, (error) => {
            // Hide Loading
            this.isLoadingView(false);

            this.errorMsg(error);
        });
    }

    onGroupTap(args) {
        console.log("------------------------ ItemTapped: " + args.index);
        let group = this.groups[args.index];
        this.routerExtensions.navigate(["group", group.UserGroupId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    addNewGroup() {
        this.routerExtensions.navigate(["subscription"], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    onLogout() {
        this.authStore.remove();
        this.routerExtensions.navigate(["login"], {
            transition: {
                name: "slideLeft"
            },
            clearHistory: true
        });
    }

    updateProfile() {
        this.routerExtensions.navigate(["user-profile"], {
            transition: {
                name: "slideLeft"
            }
        });
    }
}