import { Component, OnInit, AfterContentInit, OnDestroy, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";
import { TNSFancyAlert } from "nativescript-fancyalert";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

import { alert, action } from "ui/dialogs";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";
import { InvitationsService } from "./shared/invitations.service";

import { Invitation, InvitationModel, RejectInvitation } from "./shared/invitations.model";

import { isJson } from "../../core/check-json";
import { Auth, AuthStore } from "../../core/storage/auth-storage";


import { InvitationAcceptViewComponent } from "./shared/invitation-accept-view";

@Component({
    selector: "tracker-invitations",
    moduleId: module.id,
    templateUrl: "./invitations.component.html"
})

export class InvitationsComponent implements OnInit, AfterContentInit, OnDestroy {

    invitationModel: InvitationModel;
    invitations: Array<Invitation> = [];
    public startIndex = 1;
    //viewGroup: ViewGroup;
    isOwer: boolean = false;

    isEmptyRecords: boolean = false;
    canSeeEachOther: boolean = true;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private invitationsService: InvitationsService, private route: ActivatedRoute,
        private authStore: AuthStore, private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private modalService: ModalDialogService,
        private vcRef: ViewContainerRef) {

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

        this.getInvitations(1);
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
        if (this.invitations.length < this.invitationModel.TotalRecords) {
            this.getInvitations(this.startIndex++);
        }
    }

    getInvitations(startIndex) {
        // Show Loading
        this.isLoadingView(true);
        this.invitationsService.getInvitations(startIndex).subscribe((response) => {

            this.invitationModel = response;
            console.log("Result : " + JSON.stringify(response));
            response.Items.forEach(item => this.invitations.push(item));
            //this.selectedIndex = this.invitations.length;

            if (this.invitations.length <= 0) {
                this.isEmptyRecords = true;
            } else {
                this.isEmptyRecords = false;
            }
            // hide Loading
            this.isLoadingView(false);
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    refreshList(args) {
        var pullRefresh = args.object;
        this.invitations = [];

        this.getInvitations(1);
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
        let item = this.invitations[args.index];
        action({
            message: "Action",
            cancelButtonText: "Cancel",
            actions: ["Accept", "Reject"]
        }).then(result => {
            console.log("Dialog result: " + result);

            console.log("Tab Index: " + result);

            if (result == "Cancel") {
            }
            else {
                if (result == "Accept") {
                    this.createProblemModelView(item.InviteId).then(result => {
                        if (this.validate(result)) {
                            this.snackbarService.info("You have successfully joined the group");
                            this.invitations = [];
                            // Refresh the Invitations list
                            this.getInvitations(1);
                        }
                    }).catch(error => this.handleError(error));

                } else if (result == "Reject") {
                    this.rejectInvitations(item.InviteId);
                }
            }
        });
    }

    // Open Accept Invitation Modal
    private createProblemModelView(inviteId): Promise<any> {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: { "invite_Id": inviteId },
            fullscreen: true,
        };

        return this.modalService.showModal(InvitationAcceptViewComponent, options);
    }

    // Validate the output
    private validate(result: any) {
        return !!result;
    }

    // handle modal error
    private handleError(error: any) {
        alert("Please try again!");
        console.dir(error);
    }

    rejectInvitations(invitationId) {
        // Show Loading
        this.isLoadingView(true);

        let rejectInvitation = new RejectInvitation();
        rejectInvitation.InviteId = invitationId;

        this.invitationsService.rejectInvitation(rejectInvitation).subscribe((response) => {
            this.snackbarService.error("You have successfully rejected the group");
            // hide Loading
            this.isLoadingView(false);
            this.invitations = [];
            // Refresh the Invitations list
            this.getInvitations(1);
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }
    
}