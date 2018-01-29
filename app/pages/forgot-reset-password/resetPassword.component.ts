import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";
import { Page } from "ui/page";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ResetPasswordService } from "./shared/resetPassword.service";
import { ValidationService } from "../../core/services/validation.service";

import { ResetPasswordModel, ForgotPasswordModel } from "./shared/resetPassword.model";

import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-resetPassword",
    moduleId: module.id,
    templateUrl: "./resetPassword.component.html"

})
export class ResetPasswordComponent implements OnInit, AfterContentInit, OnDestroy {

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    paramUserName = "";
    resetPasswordModel: ResetPasswordModel;
    forgotPasswordModel: ForgotPasswordModel;

    constructor(private formBuilder: FormBuilder, private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private route: ActivatedRoute,
        private resetPasswordService: ResetPasswordService, private routerExtensions: RouterExtensions,
        private page: Page) {

        page.actionBarHidden = true;

        this.resetPasswordModel = new ResetPasswordModel();//obj
        this.forgotPasswordModel = new ForgotPasswordModel();//obj


        this.route.params.subscribe((params) => {
            this.paramUserName = params["UserName"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.userForm = this.formBuilder.group({
            Password: ['', [Validators.required, ValidationService.passwordValidator]],
            ConfirmPassword: ['', [Validators.required]],
            Code: ['', [Validators.required]]
        }, {
                validator: ValidationService.matchPassword // your validation method
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
                this.snackbarService.info("No internet connection found!");
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
    }

    public onSubmit() {
        if (this.userForm.dirty && this.userForm.valid) {

            this.resetPasswordModel.ConfirmPassword = this.userForm.value.ConfirmPassword;
            this.resetPasswordModel.Token = this.userForm.value.Code;
            this.resetPasswordModel.Password = this.userForm.value.Password;
            this.resetPasswordModel.Email = this.paramUserName;

            // Show Loading
            this.isLoadingView(true);
            this.resetPasswordService.resetPassword(this.resetPasswordModel)
                .subscribe((response) => {
                    // Hide Loading
                    this.isLoadingView(false);
                    this.routerExtensions.navigate([""], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                },
                (error) => {
                    // Hide Loading
                    this.isLoadingView(false);
                    this.errorMsg(error);
                });
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public ResendForgotPasswordToken() {
        // Show Loading
        this.isLoadingView(true);

        this.forgotPasswordModel.Email = this.paramUserName;

        this.resetPasswordService.resendForgotPasswordToken(this.forgotPasswordModel)
            .subscribe(response => {
                // Hide Loading
                this.isLoadingView(false);

                alert("Token Sent Successfully!");
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
            TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
            //alert(error.Error.join());
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
            //alert(error.Error);
        }
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage()
    }
}