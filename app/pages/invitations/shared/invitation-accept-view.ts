import { Component, OnInit, NgModule } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";

import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { TNSFancyAlert } from "nativescript-fancyalert";
import { RouterExtensions } from "nativescript-angular/router";
import { LoadingIndicator } from "nativescript-loading-indicator";

import { Page } from "ui/page";
import { alert, action } from "ui/dialogs";

import { InvitationsService } from "./invitations.service";
import { ErrorNotifierService } from "../../../core/error-notifier";
import { SnackbarMessageService } from "../../../core/snackbar-message.service";
import { ValidationService } from "../../../core/services/validation.service";

import { AcceptInvitation } from "./invitations.model";

import { isJson } from "../../../core/check-json";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./invitation-accept-view.html",
})
export class InvitationAcceptViewComponent implements OnInit {

    public invite_Id: string;
    invitation: AcceptInvitation;

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private params: ModalDialogParams, private page: Page,
        private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private invitationsService: InvitationsService, private snackbarService: SnackbarMessageService,
        public routerExtensions: RouterExtensions) {
        this.invite_Id = params.context.invite_Id;

        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });

        this.userForm = this.formBuilder.group({
            Token: ['', [Validators.required, Validators.maxLength(5), ValidationService.alphabetsWithNumberValidator]]
        });

        // Handle Error
        this.errorHandler();
    }

    ngOnInit() {

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

    public closeModal() {
        this.params.closeCallback();
    }

    public OnSubmit() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.acceptInvitation();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public acceptInvitation() {
        let loader = new LoadingIndicator();

        // optional options
        // android and ios have some platform specific options
        var options = {
            message: 'Please wait...',
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: false,
                cancelListener: function (dialog) { console.log("Loading cancelled") },
                max: 100,
                progressNumberFormat: "%1d/%2d",
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1
            },
            ios: {
                details: "Additional detail note!",
                margin: 10,
                dimBackground: true,
                color: "#4B9ED6", // color of indicator and labels
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: "yellow",
                userInteractionEnabled: false, // default true. Set false so that the touches will fall through it.
                hideBezel: true // default false, can hide the surrounding bezel
                //view: UIView, // Target view to show on top of (Defaults to entire window)
                //mode: // see iOS specific options below
            }
        };
        // Show Loading
        loader.show(options); // options is optional

        this.invitation = new AcceptInvitation();
        this.invitation.InviteId = this.invite_Id;
        this.invitation.Token = this.userForm.value.Token


        this.invitationsService.acceptInvitation(this.invitation).subscribe((response) => {
            // Hide Loading
            loader.hide();
            // If response success
            if (response.Success) {
                this.snackbarService.info(response.Message);
                this.params.closeCallback(true);
            } else {
                // Show Error
                TNSFancyAlert.showError("Error!", response.Message, "Dismiss");
            }

        }, (error) => {
            // Hide Loading
            loader.hide();

            this.errorMsg(error);
        });
    }
}