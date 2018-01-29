import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert, action } from "ui/dialogs";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { InviteGroupMemberService } from "./shared/invite-group-member.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { InviteMember } from "./shared/invite-group-member.model";

import { isJson } from "../../core/check-json";

//import { TNSFontIconService } from 'nativescript-ngx-fonticon';


@Component({
    selector: "tracker-invite-group-member",
    moduleId: module.id,
    templateUrl: "./invite-group-member.component.html"
})
export class InviteGroupMemberComponent implements OnInit, AfterContentInit, OnDestroy {

    inviteMember: InviteMember;
    groupId: string;

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private inviteGroupMemberService: InviteGroupMemberService, public routerExtensions: RouterExtensions,
        private snackbarService: SnackbarMessageService, private route: ActivatedRoute) {

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.userForm = this.formBuilder.group({
            Email: ['', [Validators.required, ValidationService.emailValidator]]
        });

        // Handle Error
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
            //alert(error.Error);
        }
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
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage();

    }

    public OnSubmit() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.senInvitation();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public senInvitation() {
        // Show Loading
        this.isLoadingView(true);

        this.inviteMember = new InviteMember();
        this.inviteMember.Email = this.userForm.value.Email;
        this.inviteMember.UserGroupId = this.groupId;

        this.inviteGroupMemberService.sendInvite(this.inviteMember)
            .subscribe(response => {

                // Hide Loading
                this.isLoadingView(false);

                TNSFancyAlert.showSuccess('Success!', 'Invitation send succefully', `Oh that's nice.`, 0, 300);

                this.routerExtensions.backToPreviousPage();

            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

}