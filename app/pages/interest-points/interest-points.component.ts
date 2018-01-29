import { Component, OnInit, AfterContentInit, OnDestroy, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";
import { TNSFancyAlert } from "nativescript-fancyalert";
import { LoadingIndicator } from "nativescript-loading-indicator";

import { Page, NavigatedData } from "ui/page";
import { alert } from "ui/dialogs";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";
import { TabsService } from "./shared/tabs.service";
import { InterestPointsService } from "./shared/interest-points.service";

import { Tab } from "./shared/tabs.model";
import { InterestPoint, InterestPoints } from "./shared/interest-points.model";

import { isJson } from "../../core/check-json";
//import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { ImageCachePipe } from "../../core/pipe/image-cache.pipe";
import { SwitchView } from "@angular/common/src/directives/ng_switch";

@Component({
    selector: "tracker-interest-points",
    moduleId: module.id,
    templateUrl: "./interest-points.component.html",
    providers: [
        ImageCachePipe
    ]
})

export class InterestPointsComponent implements OnInit, AfterContentInit, OnDestroy {

    // Default segmentBar items
    tabItems: Tab[] = [];
    public selectedIndex: number;

    userId: string;
    groupId: string;
    interestPoint: InterestPoints;
    interestPoints: Array<InterestPoint> = [];
    public startIndex = 1;
    //viewGroup: ViewGroup;
    isOwer: boolean = false;

    isEmptyRecords: boolean = false;
    //canSeeEachOther: boolean = true;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private zone: NgZone, private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private tabsService: TabsService, private interestPointsService: InterestPointsService,
        private imageCache: ImageCachePipe, private route: ActivatedRoute,
        private page: Page,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService) {

        // Get all tabs
        this.tabsService.getTabs().then(tabs => this.tabItems = tabs);
        this.selectedIndex = 2;

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        page.on(Page.navigatedToEvent, (args: NavigatedData) => {
            if (args.isBackNavigation) {
                console.log("Back Navigation");
                this.interestPoints = [];
                this.getInterestPoints(this.groupId, 1);
            }
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
       
        this.getInterestPoints(this.groupId, 1);
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
            } else if (error.Message == "GROUP_DOES_NOT_EXIST") {
                this.snackbarService.info("Group does not exists");
                this.routerExtensions.navigate([""], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            }
            else {
                TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
            }
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage();
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

    loadMoreMembers() {
        console.log('loadMoreItems');
        if (this.interestPoints.length < this.interestPoint.TotalRecords) {
            this.getInterestPoints(this.groupId, this.startIndex++);
        }
    }

    getInterestPoints(groupId, startIndex) {
        // Show Loading
        this.isLoadingView(true);
       
        //this.canSeeEachOther = true;
        this.interestPointsService.getInterestPoints(groupId, startIndex).subscribe((response) => {
            this.zone.run(() => {
                console.log("Interest Points : " + JSON.stringify(response));
                this.interestPoint = response;

                this.isOwer = this.interestPoint.IsAdmin;
                response.Items.forEach(item => this.interestPoints.push(item));
                //this.selectedIndex = this.groupMembers.length;

                if (this.interestPoints.length <= 0) {
                    this.isEmptyRecords = true;
                } else {
                    this.isEmptyRecords = false;
                }
                // hide Loading
                this.isLoadingView(false);
                
                console.log("Loading False");
            });

        },
            (error) => {
                this.zone.run(() => {
                    // Hide Loading
                    this.isLoadingView(false);   
                    
                    this.errorMsg(error);
                });

            });
    }

    refreshList(args) {
        var pullRefresh = args.object;
        this.interestPoints = [];

        this.getInterestPoints(this.groupId, 1);
        pullRefresh.refreshing = false;

        // // Show Loading
        // this.isLoadingView(true);
        //this.canSeeEachOther = true;
        // this.groupMemberService.getGroupMembers(this.groupId,1).subscribe((response) => {

        //     this.members = response;
        //     pullRefresh.refreshing = false;
        //     // hide Loading
        //     this.isLoadingView(false);
        // },
        //     (error) => {
        //         // Hide Loading
        //         this.isLoadingView(false);
        //         pullRefresh.refreshing = false;

        //         this.errorMsg(error);
        //     });
    }

    public onItemTap(args) {
        
        console.log("------------------------ ItemTapped: " + args.index);

        this.routerExtensions.navigate(["view-interest-point", this.interestPoints[args.index].InterestPointId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    public onNewInterestPoint() {
        this.routerExtensions.navigate(["add-interest-point", this.groupId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    selectTab(index, item) {
        //this.selectedIndex = index;
        this.routerExtensions.navigate([item.url, this.groupId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    group() {
        this.routerExtensions.navigate([""], {
            transition: {
                name: "slideLeft"
            }
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