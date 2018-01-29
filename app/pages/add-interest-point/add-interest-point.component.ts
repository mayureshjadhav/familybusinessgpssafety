import { Component, OnInit, AfterContentInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert, action } from "ui/dialogs";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";
import { PlacePicker } from "nativescript-google-place-picker";
import { TNSFancyAlert } from "nativescript-fancyalert";
import { MapView, Marker, Position } from "nativescript-google-maps-sdk";

import { ErrorNotifierService } from "../../core/error-notifier";
import { AddInterestPointService } from "./shared/add-interest-point.services";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { AddInterestPoint } from "./shared/add-interest-point.model";

import { isJson } from "../../core/check-json";

//import { TNSFontIconService } from 'nativescript-ngx-fonticon';


@Component({
    selector: "tracker-add-interest-point",
    moduleId: module.id,
    templateUrl: "./add-interest-point.component.html"
})
export class AddInterestPointComponent implements OnInit, AfterContentInit, OnDestroy {
    @ViewChild("MapView") mapView: ElementRef;

    addInterestPoint: AddInterestPoint;
    groupId: string;

    userForm: any;
    latitude: string = "-33.86";
    longitude: string = "151.20";

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    //mapView: MapView;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private addInterestPointService: AddInterestPointService, public routerExtensions: RouterExtensions,
        private snackbarService: SnackbarMessageService, private route: ActivatedRoute) {

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.userForm = this.formBuilder.group({
            InterestPointName: ['', [Validators.required, Validators.maxLength(100), ValidationService.alphabetsWithNumberValidator]],
            InterestPointDescription: ['', [Validators.required, Validators.maxLength(500), ValidationService.alphabetsWithNumberValidator]],
            LatitudeNLongitude: ['', [Validators.required, ValidationService.longitudeLongitudeValidator]],
            Radius: ['', [Validators.required, ValidationService.numberValidator, ValidationService.numberLessthan10000Validator]]
            //Longitude: ['', [Validators.required, ValidationService.longitudeLongitudeValidator]]
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

    //Map events
    onMapReady = (event) => {
        console.log("Map Ready");

        let mapViewM = event.object;
        mapViewM.zoom = 16;

        // Disabling zoom gestures
        mapViewM.settings.zoomGesturesEnabled = false;
        mapViewM.settings.rotateGesturesEnabled = false;
        mapViewM.settings.scrollGesturesEnabled = false;

    };

    public onShowPicker() {
        var picker = new PlacePicker()

        picker.present()
            .then((r) => {

                console.log(r.latitude)
                console.log(r.longitude)

                this.latitude = r.latitude;
                this.longitude = r.longitude;

                let mapViewM = <MapView>this.mapView.nativeElement;

                mapViewM.removeAllMarkers();

                mapViewM.zoom = 16;

                // Disabling zoom gestures
                mapViewM.settings.zoomGesturesEnabled = false;
                mapViewM.settings.rotateGesturesEnabled = false;
                mapViewM.settings.scrollGesturesEnabled = false;

                var marker = new Marker();
                marker.position = Position.positionFromLatLng(+this.latitude, +this.longitude);
                marker.userData = { index: 1 };
                mapViewM.addMarker(marker);

                let LatitudeNLongitude = this.latitude + ", " + this.longitude;

                this.userForm.controls['LatitudeNLongitude'].setValue(LatitudeNLongitude);


            })
            .catch((e) => {
                console.log("Error: " + e);
            })
    }

    OnSubmit() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.sendAddInterestPoint();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    sendAddInterestPoint() {
        // Show Loading
        this.isLoadingView(true);

        this.addInterestPoint = new AddInterestPoint();
        this.addInterestPoint.InterestPointName = this.userForm.value.InterestPointName;
        this.addInterestPoint.InterestPointDescription = this.userForm.value.InterestPointDescription;
        this.addInterestPoint.LatitudeNLongitude = this.userForm.value.LatitudeNLongitude;
        this.addInterestPoint.Radius = this.userForm.value.Radius;
        this.addInterestPoint.UserGroupId = this.groupId;

        this.addInterestPointService.addInterestPoint(this.addInterestPoint)
            .subscribe(response => {

                // Hide Loading
                this.isLoadingView(false);

                if (response.Success) {
                    this.routerExtensions.navigate(["view-interest-point", response.InterestPointId], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                } else {
                    //this.snackbarService.error("You have successfully rejected the group");
                    TNSFancyAlert.showError('Error!', response.Message, `Yeah it does.`);
                }
            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }


}