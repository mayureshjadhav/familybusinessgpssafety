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
import { UserService } from "./shared/user.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { User } from "./shared/user.model";

import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { isJson } from "../../core/check-json";


@Component({
    selector: "tracker-register",
    moduleId: module.id,
    templateUrl: "./register.component.html"
})
export class RegisterComponent implements OnInit, AfterContentInit, OnDestroy {
    user: User;
    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private userService: UserService, public routerExtensions: RouterExtensions,
        private snackbarService: SnackbarMessageService, private page: Page) {

        page.actionBarHidden = true;        

        this.userForm = this.formBuilder.group({
            Email: ['', [Validators.required, ValidationService.emailValidator]],
            Password: ['', [Validators.required, ValidationService.passwordValidator]],
            ConfirmPassword: ['', [Validators.required]]
        },{
            validator: ValidationService.matchPassword // your validation method
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
            //alert(error.Error.join());
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
    public OnRegisterUser() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.doRegistration();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public doRegistration() {
        // Show Loading
        this.isLoadingView(true);

        this.user = new User();
        this.user.Email = this.userForm.value.Email;
        this.user.Password = this.userForm.value.Password;
        this.user.ConfirmPassword = this.userForm.value.ConfirmPassword;

        this.userService.register(this.user)
            .subscribe(response => {

                // Hide Loading
                this.isLoadingView(false);

                if (response) {
                    // var toast = Toast.makeText("Registration Successful");
                    // toast.show();
                    this.routerExtensions.navigate(["validateRegistration", this.user.Email], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                }


            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);

                // var toast = Toast.makeText(error.error[0]);
                // toast.show();
            }
            );
    }

}