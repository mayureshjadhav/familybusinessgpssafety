import { Component, OnInit, AfterContentInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";

import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";
import { TimePicker } from "ui/time-picker";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";
//import { TNSFontIconService } from 'nativescript-ngx-fonticon';

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";
import { UpdateGroupService } from "./shared/update-group.service";

import { AuthStore } from "../../core/storage/auth-storage";
import { UpdateGroup, ViewGroup } from "./shared/update-group.model";


import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-update-group",
    moduleId: module.id,
    templateUrl: "./update-group.component.html"
})
export class UpdateGroupComponent implements OnInit, AfterContentInit, OnDestroy {

    @ViewChild("FromTime") fromTime: ElementRef;
    @ViewChild("ToTime") toTime: ElementRef;

    userForm: any;

    groupId: string;
    updateGroupModel: UpdateGroup;
    viewGroup: ViewGroup;

    fromTimeHours: number = 9;
    fromTimeMin: number = 0;
    toTimeHours: number = 16;
    toTimeMin: number = 0;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    //tabItems: Tab[] = [];

    constructor(private formBuilder: FormBuilder, private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private route: ActivatedRoute,
        private routerExtensions: RouterExtensions, private authStore: AuthStore,
        private updateGroupService: UpdateGroupService) {

        this.viewGroup = new ViewGroup();

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.userForm = this.formBuilder.group({
            GroupName: ['', [Validators.required, Validators.maxLength(100), ValidationService.alphabetsWithSpaceValidator]]
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
        this.getGroupDetails(this.groupId);
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
                if (error.Message == "GROUP_DOES_NOT_EXIST") {
                    this.snackbarService.info("Group does not exists");
                    this.routerExtensions.navigate([""], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                } else {
                    TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
                }
            }
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage();
    }

    public onChange(value) {
        console.log("switch : " + value);
        this.viewGroup.CanMemberSeeEachOther = value;
    }

    getGroupDetails(groupId) {
        // Show Loading
        this.isLoadingView(true);
        this.updateGroupService.get(groupId).subscribe((response) => {

            console.log("Group Details : " + JSON.stringify(response));

            this.viewGroup = response;
            if (!this.viewGroup.IsAdmin) {
                // hide Loading
                this.isLoadingView(false);
                this.snackbarService.info("You are not the owner of this group.");
                this.routerExtensions.navigate([""], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            } else {
                if (this.viewGroup.TrackingFrom != null) {
                    this.fromTimeHours = this.viewGroup.TrackingFromHours;
                    this.fromTimeMin = this.viewGroup.TrackingFromMinutes;
                }

                if (this.viewGroup.TrackingTo != null) {
                    this.toTimeHours = this.viewGroup.TrackingToHours;
                    this.toTimeMin = this.viewGroup.TrackingToMinutes;
                }

                this.userForm.controls['GroupName'].setValue(this.viewGroup.GroupName);
                // hide Loading
                this.isLoadingView(false);
            }
        },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    onDayCheck(day, value) {

        switch (day) {
            case 'Monday':
                this.viewGroup.Monday = value != null ? !value : true;
                break;
            case 'Tuesday':
                this.viewGroup.Tuesday = value != null ? !value : true;
                break;
            case 'Wednesday':
                this.viewGroup.Wednesday = value != null ? !value : true;
                break;
            case 'Thursday':
                this.viewGroup.Thursday = value != null ? !value : true;
                break;
            case 'Friday':
                this.viewGroup.Friday = value != null ? !value : true;
                break;
            case 'Saturday':
                this.viewGroup.Saturday = value != null ? !value : true;
                break;
            case 'Sunday':
                this.viewGroup.Sunday = value != null ? !value : true;
                break;

            default:
                break;
        }

    }

    updateGroup() {

        if (this.userForm.dirty && this.userForm.valid) {
            // Show Loading
            this.isLoadingView(true);

            this.updateGroupModel = new UpdateGroup();
            this.updateGroupModel.UserGroupId = this.groupId;
            this.updateGroupModel.GroupName = this.userForm.value.GroupName;
            this.updateGroupModel.CanMemberSeeEachOther = this.viewGroup.CanMemberSeeEachOther;

            if (this.viewGroup.SubscriptionType == 2) {
                let ftime = <TimePicker>this.fromTime.nativeElement;
                let dt = new Date();
                let ttime = <TimePicker>this.toTime.nativeElement;

                console.log("From Time : " + ftime.hour + ":" + ftime.minute + ":00");
                console.log("To Time : " + ttime.hour + ":" + ttime.minute + ":00");

                this.updateGroupModel.TrackingFrom = ftime.hour + ":" + ftime.minute + ":00";
                this.updateGroupModel.TrackingTo = ttime.hour + ":" + ttime.minute + ":00";

                this.updateGroupModel.Friday = this.viewGroup.Friday;
                this.updateGroupModel.Monday = this.viewGroup.Monday;
                this.updateGroupModel.Saturday = this.viewGroup.Saturday;
                this.updateGroupModel.Sunday = this.viewGroup.Sunday;
                this.updateGroupModel.Thursday = this.viewGroup.Thursday;
                this.updateGroupModel.Tuesday = this.viewGroup.Tuesday;
                this.updateGroupModel.Wednesday = this.viewGroup.Wednesday;
            }

            this.updateGroupService.update(this.updateGroupModel)
                .subscribe(response => {

                    console.log("Update Response: " + response);

                    // Hide Loading
                    this.isLoadingView(false);

                    this.routerExtensions.navigate([""], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });

                    //this.routerExtensions.backToPreviousPage();

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
}