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

import { ViewInterestPointService } from "./shared/view-interest-point.service";

import { ImageCachePipe } from "../../core/pipe/image-cache.pipe";

import { ViewInterestPointModel, DeleteInterestPointModel } from "./shared/view-interest-point.model";
import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { APIMethod, AppSettings } from "../../shared/app.constants";

import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-view-interest-point",
    moduleId: module.id,
    templateUrl: "./view-interest-point.component.html",
    providers: [
        ImageCachePipe
    ]
})

export class ViewInterestPointComponent implements OnInit, AfterContentInit, OnDestroy {
    // @ViewChild("MapView") mapView1: ElementRef;

    mapView: MapView;

    interestPointId: string;
    item: ViewInterestPointModel;
    CanEdit: boolean = false;

    // latitude: string = "-33.86";
    // longitude: string = "151.20";
    latitude: string = "";
    longitude: string = "";

    defaultImage: string = "res://profile";
    //image: any = "res://profile";

    items = [];
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
        private viewInterestPointService: ViewInterestPointService, private route: ActivatedRoute,
        private snackbarService: SnackbarMessageService, private errorNotifier: ErrorNotifierService,
        private authStore: AuthStore, private imageCache: ImageCachePipe,
        private page: Page) {

        this.item = new ViewInterestPointModel();
        this.item.ImagePath = this.defaultImage;
        this.route.params.subscribe((params) => {
            this.interestPointId = params["interestPointId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        page.on(Page.navigatedToEvent, (args: NavigatedData) => {
            if (args.isBackNavigation) {
                console.log("Back Navigation");
                this.getInterestPoint(this.interestPointId);
            }
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
        this.getInterestPoint(this.interestPointId);
    }

    getInterestPoint(interestPointId) {
        console.log("Get Interest Id : " + interestPointId);
        // Show Loading
        this.isLoadingView(true);
        this.viewInterestPointService.get(interestPointId).subscribe((response) => {
            this.zone.run(() => {
                // hide Loading
                this.isLoadingView(false);
                this.item = response;
                console.log("Item : " + JSON.stringify(this.item));

                this.CanEdit = this.item.CanEdit;

                this.latitude = this.item.Latitude;
                this.longitude = this.item.Longitude;

            });
        },
            (error) => {
                this.zone.run(() => {
                    // Hide Loading
                    this.isLoadingView(false);

                    this.errorMsg(error);
                });
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

    public DeleteInterestPoint() {
        confirm({
            title: "Delete",
            message: "Are you sure you want to delete?",
            okButtonText: "Okay",
            cancelButtonText: "Cancel"
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result) {
                //Do action1
                this.onDeleteInterestPoint();
            }
        });
    }

    onDeleteInterestPoint() {
        // Show Loading
        this.isLoadingView(true);

        let interestPoint = new DeleteInterestPointModel();
        interestPoint.InterestPointId = this.interestPointId

        this.viewInterestPointService.delete(interestPoint)
            .subscribe(response => {

                // Hide Loading
                this.isLoadingView(false);

                if(response.Success){
                    this.snackbarService.info("Interest Point deleted successfully.");
                    this.routerExtensions.navigate(["interest-points", this.item.UserGroupId], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                }else{
                    TNSFancyAlert.showError('Error!', response.Message, `Yeah it does.`);
                }

                

            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
    }

    public onEdit() {
        this.routerExtensions.navigate(["update-interest-point", this.interestPointId], {
            transition: {
                name: "slideLeft"
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

    editPhoto() {
        action({
            message: "",
            cancelButtonText: "Cancel",
            actions: ["Take Photo", "Choose From Gallery"]
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result == "Take Photo") {
                //Do action1
                this.onTakePhoto();
            } else if (result == "Choose From Gallery") {
                //Do action2
                this.onSelectSingleTap();
            }
        });
    }

    onTakePhoto() {

        requestPermissions();

        let options = {
            width: this.width,
            height: this.height,
            keepAspectRatio: this.keepAspectRatio,
            saveToGallery: this.saveToGallery
        };

        takePicture(options)
            .then(imageAsset => {
                this.imageTaken = imageAsset;
                console.log("Size: " + imageAsset.options.width + "x" + imageAsset.options.height);

                fromAsset(imageAsset).then((source) => {
                    let folder = fs.knownFolders.documents().path;
                    var fileName = "tracker" + new Date().getTime() + ".png";
                    //let fileName = new Date().toDateString() + ".png"
                    let path = fs.path.join(folder, fileName);
                    let saved = source.saveToFile(path, "png");
                    if (saved) {
                        this.item.ImagePath = path;
                        //this.image = path;
                        console.log("saved image");
                        this.sendImages(path);
                    }
                });
            }).catch(err => {
                console.log(err.message);
            });
    }

    // >> camera-module-perm-code
    onRequestPermissions() {
        requestPermissions();
    }

    onSelectSingleTap() {
        let context = imagepicker.create({
            mode: "single"
        });

        if (isAndroid) {
            permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "I need these permissions to read from storage")
                .then(() => {
                    console.log("Permissions granted!");
                    this.startSelection(context);
                })
                .catch(() => {
                    console.log("Uh oh, no permissions - plan B time!");
                });
        } else {
            this.startSelection(context);
        }

        //this.startSelection(context);
    }

    startSelection(context) {
        let _that = this;

        context
            .authorize()
            .then(() => {
                _that.items = [];
                return context.present();
            })
            .then((selection) => {
                console.log("Selection done:");
                selection.forEach((selected) => {
                    console.log("----------------");
                    console.log("uri: " + selected.uri);
                    console.log("fileUri: " + selected.fileUri);

                    this.item.ImagePath = selected.fileUri;

                    this.sendImages(selected.fileUri);
                });
                _that.items = selection;

            }).catch((e) => {
                console.log(e);
            });
    }

    extractImageName(fileUri) {
        var pattern = /[^/]*$/;
        var imageName = fileUri.match(pattern);

        return imageName;
    }

    sendImages(fileUri) {
        this.newsession = session("image-upload");

        let imageName = this.extractImageName(fileUri);
        console.log("Image Name :" + imageName);
        console.log("Image Url :" + fileUri);

        var documents = fs.knownFolders.documents();
        var file = documents.getFile(fileUri);
        var fileExtension = file.extension;
        console.log("Extension :" + fileExtension);

        var credentials = this.authStore.get();
        if (credentials != null) {
            var request = {
                url: AppSettings.API_ENDPOINT + APIMethod.UPLOAD_INTEREST_POINT_IMAGE,
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Authorization": "Bearer " + credentials.token,
                    "File-Name": imageName
                },
                description: "{ 'uploading': " + imageName + " }"
            };

            console.log("Upload Request : " + JSON.stringify(request));
            var params = [{ name: "InterestPointId", value: this.interestPointId }, { name: "fileToUpload", filename: fileUri, mimeType: this.returnExt(fileExtension) }];
            this.task = this.newsession.multipartUpload(params, request);



            this.task.on("progress", this.logEvent);
            this.task.on("error", this.logEvent);
            this.task.on("complete", this.logEvent);
        } else {

            this.routerExtensions.navigate(["login"], {
                transition: {
                    name: "slideLeft"
                },
                clearHistory: true
            });
        }


    }

    returnExt(key) {
        let extension = "image/png";
        switch (key) {
            case ".png":
                extension = "image/png";
                break;
            case ".jpg":
                extension = "image/jpeg";
                break;
            case ".jpeg":
                extension = "image/jpeg";
                break;
            case ".gif":
                extension = "image/gif";
                break;
            case ".bmp": extension = "image/bmp";
                break;
            default:
                break;
        }
        return extension;
    }

    logEvent(e) {
        switch (e.eventName) {
            case "complete":
                //alert("Upload complete");
                break;
            case "error":

                alert("Upload error" + e)
                break;
            case "progress":
                console.log("Progress : " + e);
                //alert("Upload error" + e)
                break;

            default:
                break;
        }
    }

    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
    }
}