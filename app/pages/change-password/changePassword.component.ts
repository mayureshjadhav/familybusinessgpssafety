import { Component, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";

import { RouterExtensions } from "nativescript-angular/router";

import { ErrorNotifierService } from "../../core/error-notifier";
import { ChangePasswordService } from "./shared/changePassword.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from '../../core/services/validation.service';

import { ChangePasswordModel } from "./shared/changePassword.model";

import { isJson } from "../../core/check-json";


@Component({
    selector: "tracker-change-password",
    moduleId: module.id,
    templateUrl: "./changePassword.component.html"

})
export class ChangePasswordComponent implements AfterContentInit, OnDestroy {
    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    changePasswordModel: ChangePasswordModel;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService, private changePasswordService: ChangePasswordService,
        private snackbarService: SnackbarMessageService, private routerExtensions: RouterExtensions) {

        this.changePasswordModel = new ChangePasswordModel();

        this.userForm = this.formBuilder.group({
            Password: [this.changePasswordModel.Password, [Validators.required]],
            ConfirmPassword: [this.changePasswordModel.Password, [Validators.required]]
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

    public onSubmit() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.changePasswordModel.Password = this.userForm.value.Password;
            this.changePasswordModel.ConfirmPassword = this.userForm.value.ConfirmPassword;

            // Show Loading
            this.isLoadingView(true);
            this.changePasswordService.changePassword(this.changePasswordModel)
                .subscribe((response) => {
                    // Hide Loading
                    this.isLoadingView(false);

                    this.routerExtensions.navigate([""], {
                        clearHistory: true, transition: {
                            name: "slideLeft"
                        }
                    });
                },
                (error) => {
                    // Hide Loading
                    this.isLoadingView(false);

                    // Show error                
                    if (isJson(error.error[0])) {
                        alert("Error : " + error.error[0].join());
                    }
                    else {
                        alert("Error : " + error.error[0]);
                    }
                });
        }
        else {
            this.validateAllFormFields(this.userForm);
        }

    }   


    public onGoBack() {
        this.routerExtensions.backToPreviousPage()
    }
}