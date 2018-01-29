import { Component, OnInit, AfterContentInit, OnDestroy, NgZone } from "@angular/core";
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
import { TabsService } from "./shared/tabs.service";
import { GroupMapService } from "./shared/group-map.service";

import { Tab } from "./shared/tabs.model";
import { ViewGroup } from "./shared/group-map.model";

import { isJson } from "../../core/check-json";
import { Jsonp } from "@angular/http/src/http";

@Component({
    selector: "tracker-group-map",
    moduleId: module.id,
    templateUrl: "./group-map.component.html"
})

export class GroupMapComponent implements OnInit, AfterContentInit, OnDestroy {
    // Default segmentBar items
    tabItems: Tab[] = [];
    public selectedIndex: number = 0;

    groupId: string;
    viewGroup: ViewGroup;
    isOwer: boolean = false;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private zone: NgZone, private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private tabsService: TabsService, private groupMapService: GroupMapService, private route: ActivatedRoute,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService) {

        // Get all tabs
        this.tabsService.getTabs().then(tabs => this.tabItems = tabs);

        this.viewGroup = new ViewGroup();

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
        this.getGroupDetails(this.groupId);
    }

    getGroupDetails(groupId) {
        // Show Loading
        this.isLoadingView(true);
        this.groupMapService.get(groupId).subscribe((response) => {

            console.log("Group Details : " + JSON.stringify(response));

            this.viewGroup = response;

            this.isOwer = this.viewGroup.IsAdmin;

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
        this.routerExtensions.back();
    }

    public EditGroup() {
        this.routerExtensions.navigate(["update-group", this.groupId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    public onSubscriptioDetailsTap() {
        this.routerExtensions.navigate(["subscription-details", this.groupId], {
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

    selectTab(index, item) {
        //this.selectedIndex = index;
        console.log("Item :" + JSON.stringify(item));
        this.routerExtensions.navigate([item.url, this.groupId], {
            transition: {
                name: "slideLeft"
            }
        });
        
        
        // switch (this.selectedIndex) {
        //     case 0:
            
        //         break;

        //     default:
        //         break;
        // }
    }

    updateProfile() {
        this.routerExtensions.navigate(["user-profile"], {
            transition: {
                name: "slideLeft"
            }
        });
    }
}