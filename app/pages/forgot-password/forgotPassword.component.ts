import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";
import { Page } from "ui/page";

import { isAndroid } from "platform";
import * as app from "application";

declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { ForgotPasswordService } from "./shared/forgotPassword.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from '../../core/services/validation.service';

import { ForgotPasswordModel } from "./shared/forgotPassword.model";

import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-forgotPassword",
    moduleId: module.id,
    templateUrl: "./forgotPassword.component.html"

})
export class ForgotPasswordComponent implements OnInit, AfterContentInit, OnDestroy {

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    forgotPasswordModel: ForgotPasswordModel;

    constructor(private formBuilder: FormBuilder, private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private forgotPasswordService: ForgotPasswordService,
        private routerExtensions: RouterExtensions, private page: Page) {        

        page.actionBarHidden = true;

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

    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
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
                this.snackbarService.info("No internet connection found!");
            }
        });
    }

    errorMsg(error) {
        // Show error                
        if (isJson(error)) {
            TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
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

    public onSubmit() {

        if (this.userForm.dirty && this.userForm.valid) {
            this.forgotPasswordModel = new ForgotPasswordModel();
            
            this.forgotPasswordModel.Email = this.userForm.value.Email;

            // Show Loading
            this.isLoadingView(true);

            this.forgotPasswordService.sendForgotPasswordEmail(this.forgotPasswordModel)
                .subscribe(response => {
                    // Hide Loading
                    this.isLoadingView(false);

                    this.routerExtensions.navigate(["resetPassword", this.forgotPasswordModel.Email], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                },
                (error) => {
                    // Hide Loading
                    this.isLoadingView(false);
                    // Show error                
                    this.errorMsg(error);
                });

        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }
}