import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert, action } from "ui/dialogs";
import { SegmentedBar, SegmentedBarItem, SelectedIndexChangedEventData } from "ui/segmented-bar";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
//import {Promise, BaseError} from "ts-promise";

import * as permissions from "nativescript-permissions";

declare var android: any; //bypass the TS warnings
declare var java: any; //bypass the TS warnings
declare var CLGeocoder: any; //bypass the TS warnings
declare var BaseError: any; //bypass the TS warnings
declare var ABCreateStringWithAddressDictionary: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";

import { TNSFancyAlert } from "nativescript-fancyalert";
import { Contact, getContact } from "nativescript-contacts";
import * as imagepicker from "nativescript-imagepicker";
import { session, Session, Task } from "nativescript-background-http";

import { ImageAsset } from "image-asset";
import * as fs from "tns-core-modules/file-system";
import { fromAsset, fromUrl, ImageSource, fromFile, fromNativeSource } from "image-source";
import * as imageCacheModule from "tns-core-modules/ui/image-cache";


import { takePicture, requestPermissions, isAvailable } from "nativescript-camera";
import { Location, getCurrentLocation, enableLocationRequest, isEnabled } from "nativescript-geolocation";

import { ErrorNotifierService } from "../../core/error-notifier";
import { UserProfileService } from "./shared/user-profile.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { UserProfile } from "./shared/user-profile.model";

import { Auth, AuthStore } from "../../core/storage/auth-storage";
import { APIMethod, AppSettings } from "../../shared/app.constants";

import { isJson } from "../../core/check-json";

import { ImageCachePipe } from "../../core/pipe/image-cache.pipe";

//import { TNSFontIconService } from 'nativescript-ngx-fonticon';


@Component({
    selector: "tracker-user-profile",
    moduleId: module.id,
    templateUrl: "./user-profile.component.html",
    providers: [
        ImageCachePipe
    ]
})
export class UserProfileComponent implements OnInit, AfterContentInit, OnDestroy {


    genders: Array<SegmentedBarItem>;
    user: UserProfile;
    email: string;
    address: string;
    latitude: string;
    longitude: string;
    gender: number = 0;
    defaultImage: string = "res://profile";
    image: any = "res://profile";

    items = [];
    newsession: Session;
    task: Task;

    // >> camera-module-photo-code
    public imageTaken: ImageAsset;
    public saveToGallery: boolean = true;
    public keepAspectRatio: boolean = true;
    public width: number = 300;
    public height: number = 300;

    // selectedIndex: number;
    // items: Array;

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private userService: UserProfileService, public routerExtensions: RouterExtensions,
        private snackbarService: SnackbarMessageService, private route: ActivatedRoute,
        private authStore: AuthStore, private imageCache: ImageCachePipe) {

        

        this.userForm = this.formBuilder.group({
            Name: ['', [Validators.required, Validators.maxLength(100), ValidationService.alphabetsWithSpaceValidator]],
            PhoneNumber: ['', [Validators.required, ValidationService.phoneNumberValidator]],
            // Gender: [0, [Validators.required]],
            // Address: ['', [Validators.required]],
            // Latitude: ['', []],
            // Longitude: ['', []],
            EmergencyContact1: ['', [ValidationService.phoneNumberValidator]],
            EmergencyContact2: ['', [ValidationService.phoneNumberValidator]],
            EmergencyContact3: ['', [ValidationService.phoneNumberValidator]],
            EmergencyContact4: ['', [ValidationService.phoneNumberValidator]]
        });


        //this.selectedIndex = 0;
        //this.items = [{ title: 'Male' }, { title: 'Female' }, { title: 'Other' }];

        // this.route.params.subscribe((params) => {
        //     this.email = params["UserName"];
        // });

        // let credentials = this.authStore.get();

        // if (credentials != null) {
        //     this.email = credentials.userName;
        // }

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
            if (error.Message != "USER_PROFILE_MESSAGE") {
                TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
            }
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

        let credentials = this.authStore.get();

        if (credentials != null) {
            this.email = credentials.userName;
        }

        // Get profile Details
        this.getProfile();
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage();

    }

    userProfileModel(userProfile) {
        this.userForm.controls['Name'].setValue(userProfile.Name == null ? '' : userProfile.Name);
        this.userForm.controls['PhoneNumber'].setValue(userProfile.PhoneNumber == null ? '' : userProfile.PhoneNumber);
        this.userForm.controls['EmergencyContact1'].setValue(userProfile.EmergencyContact1 == null ? '' : userProfile.EmergencyContact1);
        this.userForm.controls['EmergencyContact2'].setValue(userProfile.EmergencyContact2 == null ? '' : userProfile.EmergencyContact2);
        this.userForm.controls['EmergencyContact3'].setValue(userProfile.EmergencyContact3 == null ? '' : userProfile.EmergencyContact3);
        this.userForm.controls['EmergencyContact4'].setValue(userProfile.EmergencyContact4 == null ? '' : userProfile.EmergencyContact4);
        // this.userForm = this.formBuilder.group({
        //     Name: [userProfile.Name, [Validators.required, ValidationService.alphabetsWithSpaceValidator]],
        //     PhoneNumber: [userProfile.PhoneNumber, [Validators.required, ValidationService.phoneNumberValidator]],
        //     // Gender: [userProfile.Gender, [Validators.required]],
        //     // Address: [userProfile.Address, [Validators.required]],
        //     // Latitude: [userProfile.Latitude, [Validators.required, ValidationService.latitudeValidator]],
        //     // Longitude: [userProfile.Longitude, [Validators.required, ValidationService.longitudeValidator]],
        //     EmergencyContact1: [userProfile.EmergencyContact1, [ValidationService.phoneNumberValidator]],
        //     EmergencyContact2: [userProfile.EmergencyContact2, [ValidationService.phoneNumberValidator]],
        //     EmergencyContact3: [userProfile.EmergencyContact3, [ValidationService.phoneNumberValidator]],
        //     EmergencyContact4: [userProfile.EmergencyContact4, [ValidationService.phoneNumberValidator]]
        // });

        this.gender = userProfile.Gender == null ? 0 : userProfile.Gender;
        this.latitude = userProfile.Latitude;
        this.longitude = userProfile.Longitude;
        this.address = userProfile.Address;
        this.image = userProfile.ProfileImage;
        // let img = userProfile.ProfileImage == null ? this.defaultImage : AppSettings.API_ENDPOINT + userProfile.ProfileImage;
        // //this.image = userProfile.ProfileImage == null ? this.defaultImage : AppSettings.API_ENDPOINT + userProfile.ProfileImage;
        // if (userProfile.ProfileImage != null) {
        //     fromUrl(img).then((res: ImageSource) => {
        //         console.log("Image : " + res);
        //         this.image = res;
        //         // let thumbImg = this.thumbImage.nativeElement;
        //         // thumbImg.src = res;
        //     }).catch(err => {
        //         console.log("Image Path : " + img);
        //         console.log("Image Error call : " + err); // Error: Response content may not be converted to an Image
        //     });
            
        //     // var cache = new imageCacheModule.Cache();
        //     // cache.placeholder = fromFile(fs.path.join(__dirname, "res/profile.png"));
        //     // cache.maxRequests = 5;
            
        //     // // Enable download while not scrolling
        //     // cache.enableDownload();
            
        //     // //var imgSouce: ImageSource;
        //     // var url = img;
        //     // // Try to read the image from the cache
        //     // var image = cache.get(url);
        //     // console.log("Cache image Url : " + image);
        //     // if (image) {
        //     //     console.log("Cache image : " + image);
        //     //     // If present -- use it.
        //     //     this.image = fromNativeSource(image);
        //     // }
        //     // else {
        //     //     console.log("Not Cache image Url : " + url);
        //     //     // If not present -- request its download.
        //     //     cache.push({
        //     //         key: url,
        //     //         url: url,
        //     //         completed: (image: any, key: string) => {
        //     //             console.log("Cached image Complete : " + image);
        //     //             if (url === key) {
        //     //                 console.log("Cached image saved : " + image);
        //     //                 this.image = fromNativeSource(image);
        //     //             }
        //     //         }
        //     //     });
        //     // }
            
        //     // // Disable download while scrolling
        //     // cache.disableDownload();
        // }


        // console.log("Image Path :" + this.image);
        // // let gen = <SegmentedBar>this.genderElement.nativeElement;
        // // gen.selectedIndex = userProfile.Gender;
    }

    public getProfile() {
        // Show Loading
        this.isLoadingView(true);
        this.userService.get().subscribe((response) => {
            //Assign User Profile details
            this.userProfileModel(response);
            // Hide Loading
            this.isLoadingView(false);

        }, (error) => {
            // Hide Loading
            this.isLoadingView(false);

            this.errorMsg(error);
        });
    }

    public OnSubmit() {
        
        if (this.userForm.dirty && this.userForm.valid) {
            this.updateProfile();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public updateProfile() {
        // Show Loading
        this.isLoadingView(true);

        this.user = new UserProfile();
        this.user.Name = this.userForm.value.Name;
        this.user.Address = this.address;
        this.user.EmergencyContact1 = this.userForm.value.EmergencyContact1;
        this.user.EmergencyContact2 = this.userForm.value.EmergencyContact2;
        this.user.EmergencyContact3 = this.userForm.value.EmergencyContact3;
        this.user.EmergencyContact4 = this.userForm.value.EmergencyContact4;
        this.user.Gender = this.gender;
        this.user.Latitude = this.latitude;
        this.user.Longitude = this.longitude;
        this.user.PhoneNumber = this.userForm.value.PhoneNumber;

        this.userService.update(this.user)
            .subscribe(response => {

                // Hide Loading
                this.isLoadingView(false);

                this.routerExtensions.navigate(["",], {
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

    public contactPicker(control) {
        // this.userForm.controls['EmergencyContact1'].setValue("9578515645");
        // console.log("Name : "+ this.userForm.value.Name);
        if (isAndroid) {
            permissions.requestPermission(android.Manifest.permission.READ_CONTACTS, "I need these permissions because I'm cool")
                .then(() => {
                    console.log("Permission Granted!");
                    getContact().then((args) => {
                        if (args.response === "selected") {
                            console.log(JSON.stringify(args.data));

                            var contact = args.data; //See data structure below                            

                            //lets say you want to get the phone numbers
                            contact.phoneNumbers.forEach((phone) => {
                                switch (control) {
                                    case 'EmergencyContact1':
                                        this.userForm.controls['EmergencyContact1'].setValue(phone.value);
                                        console.log(phone.value);
                                        break;
                                    case 'EmergencyContact2':
                                        this.userForm.controls['EmergencyContact2'].setValue(phone.value);
                                        console.log(phone.value);
                                        break;
                                    case 'EmergencyContact3':
                                        this.userForm.controls['EmergencyContact3'].setValue(phone.value);
                                        console.log(phone.value);
                                        break;
                                    case 'EmergencyContact4':
                                        this.userForm.controls['EmergencyContact4'].setValue(phone.value);
                                        console.log(phone.value);
                                        break;
                                    default:
                                        break;
                                }

                            });

                        }
                    });
                })
                .catch(() => {
                    console.log("Permission Denied!");
                });
        } else {
            getContact().then((args) => {
                if (args.response === "selected") {
                    console.log(JSON.stringify(args.data));

                    var contact = args.data; //See data structure below                            

                    //lets say you want to get the phone numbers
                    contact.phoneNumbers.forEach(function (phone) {
                        switch (control) {
                            case 'EmergencyContact1':
                                this.userForm.controls['EmergencyContact1'].setValue(phone.value);
                                console.log(phone.value);
                                break;
                            case 'EmergencyContact2':
                                this.userForm.controls['EmergencyContact2'].setValue(phone.value);
                                console.log(phone.value);
                                break;
                            case 'EmergencyContact3':
                                this.userForm.controls['EmergencyContact3'].setValue(phone.value);
                                console.log(phone.value);
                                break;
                            case 'EmergencyContact4':
                                this.userForm.controls['EmergencyContact4'].setValue(phone.value);
                                console.log(phone.value);
                                break;
                            default:
                                break;
                        }

                    });

                }
            });
        }

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

    genderSelect() {
        action({
            message: "Select Gender",
            cancelButtonText: "Cancel",
            actions: ["Male", "Female", "Other"]
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result == "Male") {
                //Do action1
                this.gender = 0;
            } else if (result == "Female") {
                //Do action2
                this.gender = 1;
            } else if (result == "Other") {
                //Do action3
                this.gender = 2;
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
                        this.image = path;
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

                    this.image = selected.fileUri;

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
                url: AppSettings.API_ENDPOINT + APIMethod.UPLOAD_IMAGE,
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Authorization": "Bearer " + credentials.token,
                    "File-Name": imageName
                },
                description: "{ 'uploading': " + imageName + " }"
            };

            console.log("Upload Request : " + JSON.stringify(request));
            var params = [{ name: "fileToUpload", filename: fileUri, mimeType: this.returnExt(fileExtension) }];
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
                alert("Upload complete");
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

    public enableLocationTap() {
        console.log("Enable");
        // if (!isEnabled) {
        console.log("Enable Call");
        enableLocationRequest().then(() => {
            getCurrentLocation({ timeout: 155000 })
                .then((location) => {
                    console.log('Location received: ' + JSON.stringify(location));
                    this.getGeocode({ location: location })
                        .then((result) => {
                            console.log("---------------------Promice---------------------------------");
                            console.log(JSON.stringify(result));
                            this.latitude = result.latitude;
                            this.longitude = result.longitude;
                            //this.userForm.controls['Latitude'].setValue(result.latitude);
                            //this.userForm.controls['Longitude'].setValue(result.longitude);
                            //this.userForm.controls['Address'].setValue(result.subAdminArea + " " + result.subThoroughfare + " " + result.locality + " " + result.adminArea + " " + result.postalCode + + " " + result.country);
                            if (result.addressLines.length > 0) {
                                this.address = result.addressLines[0];
                                //this.userForm.controls['Address'].setValue(result.addressLines[0])
                            }
                        })
                        .catch((e) => { console.log(e) });

                }).catch((error) => {
                    console.log('Location error received: ' + error);
                    alert('Location error received: ' + error);
                });
        }, (e) => {
            console.log("Error: " + (e.message || e));
        });
        // }
    }

    getGeocode(args: { location: Location }): Promise<any> {
        let position: any;
        if (!args.location)
            return new Promise(function (reject) { return reject("error") });

        if (isAndroid) {
            return new Promise(function (resolve, reject) {
                var locale = java.util.Locale.getDefault();
                var geocoder = new android.location.Geocoder(app.android.currentContext, locale);
                var addresses = geocoder.getFromLocation(args.location.latitude, args.location.longitude, 1);
                if (addresses != null && addresses.size() > 0) {
                    var address = addresses.get(0);
                    position = <any>{
                        latitude: address.getLatitude(),
                        longitude: address.getLongitude(),
                        subThoroughfare: address.getThoroughfare(),
                        thoroughfare: address.getSubThoroughfare(),
                        locality: address.getLocality(),
                        subLocality: address.getSubLocality(),
                        adminArea: address.getAdminArea(),
                        subAdminArea: address.getSubAdminArea(),
                        postalCode: address.getPostalCode(),
                        country: address.getCountryName(),
                        countryCode: address.getCountryCode(),
                        addressLines: []
                    }

                    for (var i = 0; i <= address.getMaxAddressLineIndex(); i++) {
                        position.addressLines.push(address.getAddressLine(i));
                    }
                    return resolve(position);
                }
            });
        }
        if (isIOS) {
            return new Promise(function (resolve, reject) {
                let geocoder = new CLGeocoder();
                geocoder.reverseGeocodeLocationCompletionHandler(
                    args.location,
                    (placemarks, error) => {
                        if (error) {
                            console.log(error);
                            var newerror = new BaseError("error", "error");
                            return reject(newerror);
                        } else if (placemarks && placemarks.count > 0) {
                            let pm = placemarks[0];
                            let addressDictionary = pm.addressDictionary;
                            let address = ABCreateStringWithAddressDictionary(addressDictionary, false);
                            position = <any>{
                                latitude: args.location.latitude,
                                longitude: args.location.longitude,
                                subThoroughfare: addressDictionary.objectForKey('SubThoroughfare'),
                                thoroughfare: addressDictionary.objectForKey('Thoroughfare'),
                                locality: addressDictionary.objectForKey('City'),
                                subLocality: addressDictionary.objectForKey('SubLocality'),
                                adminArea: addressDictionary.objectForKey('State'),
                                subAdminArea: addressDictionary.objectForKey('SubAdministrativeArea'),
                                postalCode: addressDictionary.objectForKey('ZIP'),
                                country: addressDictionary.objectForKey('Country'),
                                countryCode: addressDictionary.objectForKey('CountryCode'),
                                addressLines: []
                            };

                            let lines = addressDictionary.objectForKey('FormattedAddressLines');
                            for (var i = 0; i < lines.count; i++) {
                                position.addressLines.push(lines[i]);
                            }
                            return resolve(position);
                        }
                    });
            });

        }

    }

}