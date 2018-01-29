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
import { GroupMembersService } from "./shared/group-members.service";

import { Tab } from "./shared/tabs.model";
import { GroupMembers, Members, InterestArrival, InterestDeparture } from "./shared/group-members.model";

import { isJson } from "../../core/check-json";
import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { ImageCachePipe } from "../../core/pipe/image-cache.pipe";
import { SwitchView } from "@angular/common/src/directives/ng_switch";

@Component({
    selector: "tracker-group-members",
    moduleId: module.id,
    templateUrl: "./group-members.component.html",
    providers: [
        ImageCachePipe
    ]
})

export class GroupMembersComponent implements OnInit, AfterContentInit, OnDestroy {

    // Default segmentBar items
    tabItems: Tab[] = [];
    public selectedIndex: number;

    userId: string;
    groupId: string;
    members: Members;
    groupMembers: Array<GroupMembers> = [];
    public startIndex = 1;
    //viewGroup: ViewGroup;
    isOwer: boolean = false;

    isEmptyRecords: boolean = false;
    canSeeEachOther: boolean = true;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private zone: NgZone, private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private tabsService: TabsService, private groupMemberService: GroupMembersService,
        private imageCache: ImageCachePipe, private route: ActivatedRoute,
        private page: Page, private authStore: AuthStore,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService) {

        // Get all tabs
        this.tabsService.getTabs().then(tabs => this.tabItems = tabs);
        this.selectedIndex = 1;
        

        this.userId = authStore.get().userId;

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        page.on(Page.navigatedToEvent, (args: NavigatedData) => {
            if (args.isBackNavigation) {
                console.log("Back Navigation");
                this.groupMembers = [];
                this.getGroupMembers(this.groupId, 1);
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
       
        this.getGroupMembers(this.groupId, 1);
    }

    loadMoreMembers() {
        console.log('loadMoreItems');
        if (this.groupMembers.length < this.members.TotalRecords) {
            this.getGroupMembers(this.groupId, this.startIndex++);
        }
    }

    onMemberTap(args) {
        console.log("------------------------ ItemTapped: " + args.index);
        let group = this.groupMembers[args.index];
        this.routerExtensions.navigate(["view-member", group.UserGroupId, group.UserProfileId], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    getGroupMembers(groupId, startIndex) {
        // Show Loading
        this.isLoadingView(true);
       
        this.canSeeEachOther = true;
        this.groupMemberService.getGroupMembers(groupId, startIndex).subscribe((response) => {
            this.zone.run(() => {
                console.log("Grop members : " + JSON.stringify(response));
                this.members = response;

                this.isOwer = this.members.IsAdmin;
                response.Items.forEach(item => this.groupMembers.push(item));
                //this.selectedIndex = this.groupMembers.length;

                if (this.groupMembers.length <= 0) {
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
        this.groupMembers = [];

        this.getGroupMembers(this.groupId, 1);
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
            else if (error.Message == "CAN_NOT_SEE_MEMBERS") {
                this.canSeeEachOther = false;
            } else {
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

    public onArrivalChange(otherGroupMemberId, sw) {
        if (sw != null) {
            sw = !sw;
        } else {
            sw = false;
        }

        let arrival = new InterestArrival();
        arrival.NotifyOnArrive = sw;
        arrival.OtherMemberId = otherGroupMemberId;
        arrival.UserGroupId = this.groupId;
        this.updateArrival(arrival);
    }

    public onDepartureChange(otherGroupMemberId, sw) {
        if (sw != null) {
            sw = !sw;
        } else {
            sw = false;
        }

        let arrival = new InterestDeparture();
        arrival.NotifyOnLeave = sw;
        arrival.OtherMemberId = otherGroupMemberId;
        arrival.UserGroupId = this.groupId;
        this.updateDeparture(arrival);
    }

    updateArrival(arrival) {
        // Show Loading
        this.isLoadingView(true);
        this.canSeeEachOther = true;
        this.groupMemberService.updateArrivalNotify(arrival).subscribe((response) => {
            // hide Loading
            this.isLoadingView(false);
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    updateDeparture(departure) {
        // Show Loading
        this.isLoadingView(true);
        this.canSeeEachOther = true;
        this.groupMemberService.updateDepartureNotify(departure).subscribe((response) => {
            // hide Loading
            this.isLoadingView(false);
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    public onNewMemberClick() {
        this.routerExtensions.navigate(["invite-member", this.groupId], {
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