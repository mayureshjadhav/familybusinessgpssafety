import { Component, OnInit, AfterContentInit, OnDestroy, ViewChild, ElementRef, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";
import { TNSFancyAlert } from "nativescript-fancyalert";
import { MapView, Marker, Position } from "nativescript-google-maps-sdk";
import * as imagepicker from "nativescript-imagepicker";
import { session, Session, Task } from "nativescript-background-http";

import { ImageAsset } from "image-asset";
import * as fs from "tns-core-modules/file-system";
import { fromAsset, fromUrl, ImageSource, fromFile, fromNativeSource } from "image-source";
import * as imageCacheModule from "tns-core-modules/ui/image-cache";


import { takePicture, requestPermissions, isAvailable } from "nativescript-camera";

import * as permissions from "nativescript-permissions";

declare var android: any; //bypass the TS warnings

import { Page, NavigatedData } from "ui/page";
import { alert, action, confirm } from "ui/dialogs";
//import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { ViewMemberService } from "./shared/view-member.service";

import { ImageCachePipe } from "../../core/pipe/image-cache.pipe";

import { ViewMemberModel } from "./shared/view-member.model";
import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { APIMethod, AppSettings } from "../../shared/app.constants";

import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-view-member",
    moduleId: module.id,
    templateUrl: "./view-member.component.html",
    providers: [
        ImageCachePipe
    ]
})

export class ViewMemberComponent implements OnInit, AfterContentInit, OnDestroy {
    // @ViewChild("MapView") mapView1: ElementRef;

    mapView: MapView;

    groupId: string;
    userProfileId: string;
    item: ViewMemberModel;
    CanUpdate: boolean = false;

    // latitude: string = "-33.86";
    // longitude: string = "151.20";
    latitude: string = "";
    longitude: string = "";

    defaultImage: string = "res://profile";
    //image: any = "res://profile";

    newsession: Session;
    task: Task;

    // >> camera-module-photo-code
    public imageTaken: ImageAsset;
    public saveToGallery: boolean = true;
    public keepAspectRatio: boolean = true;
    public width: number = 300;
    public height: number = 300;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private zone: NgZone, private routerExtensions: RouterExtensions, private routeParams: ActivatedRoute,
        private viewMemberService: ViewMemberService, private route: ActivatedRoute,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService,
        private authStore: AuthStore, private imageCache: ImageCachePipe,
        private page: Page) {

        this.item = new ViewMemberModel();
        this.item.ProfileImage = this.defaultImage;
        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            this.userProfileId = params["userProfileId"];
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

    ngOnInit() {
        if (isAndroid) {
            // prevent the soft keyboard from showing initially when textfields are present
            app.android.startActivity.getWindow().setSoftInputMode(
                android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
        }
        this.getMemberDetails(this.groupId, this.userProfileId);
    }

    getMemberDetails(groupId, userProfileId) {
        
        // Show Loading
        this.isLoadingView(true);
        this.viewMemberService.get(groupId, userProfileId).subscribe((response) => {
            // hide Loading
            this.isLoadingView(false);
            this.CanUpdate = true;

            this.item = response;              

            this.latitude = this.item.Latitude;
            this.longitude = this.item.Longitude;
        },
            (error) => {
                this.CanUpdate = false;
                 // Hide Loading
                 this.isLoadingView(false);

                 this.errorMsg(error);
            });
    }


    //Map events
    onMapReady(event) {
        console.log("Map Ready");
        this.mapView = event.object;
        this.mapView.zoom = 16;
        this.mapView.latitude = +this.latitude;
        this.mapView.longitude = +this.longitude;


        var marker = new Marker();
        marker.position = Position.positionFromLatLng(+this.latitude, +this.longitude);

        marker.userData = { index: 1 };
        this.mapView.addMarker(marker);

        // Disabling zoom gestures
        this.mapView.settings.zoomGesturesEnabled = false;
        this.mapView.settings.rotateGesturesEnabled = false;
        this.mapView.settings.scrollGesturesEnabled = false;

    };

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

    public DeleteGroupMember() {
        confirm({
            title: "Delete",
            message: "Are you sure you want to delete?",
            okButtonText: "Okay",
            cancelButtonText: "Cancel"
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result) {
                //Do action1
                this.onDeleteGroupMember();
            }
        });
    }

    onDeleteGroupMember() {
        // // Show Loading
        // this.isLoadingView(true);

        // let interestPoint = new DeleteInterestPointModel();
        // interestPoint.InterestPointId = this.interestPointId

        // this.viewInterestPointService.delete(interestPoint)
        //     .subscribe(response => {

        //         // Hide Loading
        //         this.isLoadingView(false);

        //         if(response.Success){
        //             this.snackbarService.info("Interest Point deleted successfully.");
        //             this.routerExtensions.navigate(["interest-points", this.item.UserGroupId], {
        //                 transition: {
        //                     name: "slideLeft"
        //                 }
        //             });
        //         }else{
        //             TNSFancyAlert.showError('Error!', response.Message, `Yeah it does.`);
        //         }

                

        //     },
        //     (error) => {
        //         // Hide Loading
        //         this.isLoadingView(false);

        //         this.errorMsg(error);
        //     });
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
}