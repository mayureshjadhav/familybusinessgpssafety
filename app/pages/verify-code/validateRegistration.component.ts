import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, AfterContentInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";
import { Page } from "ui/page";

import * as app from 'application';
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { ValidateRegistrationModel } from "./shared/validateRegistration.model";

import { ValidateRegistrationService } from "./shared/validateRegistration.service";

import { isJson } from "../../core/check-json";



@Component({
    selector: "tracker-validateRegistration",
    moduleId: module.id,
    templateUrl: "./validateRegistration.component.html"

})
export class ValidateRegistrationComponent implements AfterContentInit, OnDestroy {

    validateRegistrationModel: ValidateRegistrationModel;
    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;
    paramEmail = "";

    inValidToken = false;


    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private validateRegistrationService: ValidateRegistrationService, public routerExtensions: RouterExtensions,
        private snackbarService: SnackbarMessageService, private route: ActivatedRoute, private page: Page) {

        page.actionBarHidden = true;

        this.route.params.subscribe((params) => {
            this.paramEmail = params["Email"];
        });

        this.userForm = this.formBuilder.group({
            token: ['', [Validators.required]]
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


    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
    }


    public ValidateRegistration() {

        if (this.userForm.dirty && this.userForm.valid) {
            // Show Loading
            this.isLoadingView(true);

            this.validateRegistrationModel = new ValidateRegistrationModel();//obj

            this.validateRegistrationModel.Email = this.paramEmail;
            this.validateRegistrationModel.Token = this.userForm.value.token;

            this.validateRegistrationService.ValidateRegistration(this.validateRegistrationModel)
                .subscribe(response => {
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
    public ResendRegistrationToken() {
        // Show Loading
        this.isLoadingView(true);
        this.validateRegistrationService.ResendRegistrationToken(this.paramEmail)
            .subscribe(response => {
                // Hide Loading
                this.isLoadingView(false);
                alert("Token Sent Successfully!");
            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            }
            );
    }

    public onGoBack() {
        this.routerExtensions.back();
    }
}
