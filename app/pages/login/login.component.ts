import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { alert } from "ui/dialogs";
import { Page } from "ui/page";
import * as timePickerModule from "tns-core-modules/ui/time-picker";

import { isAndroid } from "platform";
import * as app from "application";

declare var android: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";
import { BackgroundGeolocation } from "nativescript-background-geolocation-lt";
// import { register, onMessageReceived } from "nativescript-push-notifications";
import * as pushPlugin from "nativescript-push-notifications";
// import { requestPermission, schedule, cancel } from "nativescript-local-notifications";
import * as LocalNotifications from "nativescript-local-notifications";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { LoginService } from "./shared/login.service";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
import { ValidationService } from "../../core/services/validation.service";

import { LoginUser, RegisterPushNotification, GeofenceNotificationModel } from "./shared/login.model";
import { APIMethod, AppSettings } from "../../shared/app.constants";

import { Auth, AuthStore } from "../../core/storage/auth-storage";

import { isJson } from "../../core/check-json";



@Component({
    selector: "tracker-login",
    moduleId: module.id,
    //providers: [LoginService],
    templateUrl: "./login.component.html"

})
export class LoginComponent implements OnInit, AfterContentInit, OnDestroy {

    userForm: any;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;


    loginUser: LoginUser;
    auth: Auth;

    constructor(private formBuilder: FormBuilder, private errorNotifier: ErrorNotifierService,
        private loginService: LoginService, private snackbarService: SnackbarMessageService,
        private routerExtensions: RouterExtensions, private authStore: AuthStore, private page: Page) {

        page.actionBarHidden = true;

        var timePicker = new timePickerModule.TimePicker();
        timePicker.hour = 9;
        timePicker.minute = 25;

        console.log("Time :" + timePicker.time);

        this.userForm = this.formBuilder.group({
            UserName: ['', [Validators.required, ValidationService.emailValidator]],
            Password: ['', [Validators.required]]
        });

        this.loginUser = new LoginUser();
        this.auth = new Auth();

        // Handle Error
        this.errorHandler();
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
        console.log("Error Msg : " + JSON.stringify(error));
        // Show error                
        if (isJson(error)) {
            if (error.error == "Email_Not_Verified") {
                this.routerExtensions.navigate(["validateRegistration", this.userForm.value.UserName], {
                    transition: {
                        name: "slideLeft"
                    }
                });
            }
            else {
                TNSFancyAlert.showError("Error!", error.error_description, "Dismiss");
                //alert(error.error_description);
            }

        }
        else {
            //alert("Error : " + error);
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
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
    }

    // loading the view
    public isLoadingView(flag: boolean) {
        console.log("Flag : " + flag);
        this.isLoading = flag;
    }

    public onForgotPassword() {
        this.routerExtensions.navigate(["forgotPassword"], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    public onResetPassword() {
        this.routerExtensions.navigate(["changePassword"], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    public onSignUp() {

        this.routerExtensions.navigate(["register"], {
            transition: {
                name: "slideLeft"
            }
        });

    }

    public onLogin() {
        if (this.userForm.dirty && this.userForm.valid) {
            this.doLogin();
        }
        else {
            this.validateAllFormFields(this.userForm);
        }
    }

    public doLogin() {
        // Show Loading
        this.isLoadingView(true);

        this.loginUser = new LoginUser();
        this.loginUser.UserName = this.userForm.value.UserName;
        this.loginUser.Password = this.userForm.value.Password;


        this.loginService.Login(this.loginUser)
            .subscribe((response) => {
                // Hide Loading
                this.isLoadingView(false);

                console.log('login response' + JSON.stringify(response));
                this.auth.refreshToken = response.refresh_token;
                this.auth.token = response.access_token;
                this.auth.userName = this.loginUser.UserName;
                this.auth.userId = response.userId;
                this.auth.role = response.role;
                this.authStore.save(this.auth);

                // 1. Listen to events
                BackgroundGeolocation.on("location", this.onLocation.bind(this));
                //BackgroundGeolocation.on("motionchange", this.onMotionChange.bind(this));      
                BackgroundGeolocation.on('http', this.onHttp.bind(this));
                //BackgroundGeolocation.on('providerchange', this.onProviderChange.bind(this));
                //BackgroundGeolocation.on('powersavechange', this.onPowerSaveChange.bind(this));
                //BackgroundGeolocation.on('schedule', this.onSchedule.bind(this));
                BackgroundGeolocation.on('activitychange', this.onActivityChange.bind(this));
                //BackgroundGeolocation.on('heartbeat', this.onHeartbeat.bind(this));
                BackgroundGeolocation.on('geofence', this.onGeofence.bind(this));
                //BackgroundGeolocation.on('geofenceschange', this.onGeofencesChange.bind(this));

                // Configure it.
                BackgroundGeolocation.configure({
                    debug: true,
                    preventSuspend: true,
                    stopOnTerminate: false,
                    startOnBoot: true,
                    desiredAccuracy: 0,
                    stationaryRadius: 25,
                    distanceFilter: 10,
                    activityRecognitionInterval: 10,
                    url: AppSettings.API_ENDPOINT + APIMethod.UPDATE_LOCATION,
                    params: {
                        UserId: response.userId
                    },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    autoSync: true,
                    locationAuthorizationAlert: {
                        titleWhenNotEnabled: "Yo, location-services not enabled",
                        titleWhenOff: "Yo, location-services OFF",
                        instructions: "You must enable 'Always' in location-services, buddy",
                        cancelButton: "Cancel",
                        settingsButton: "Settings"
                    }
                }, (state) => {
                    console.log("Background Location State : " + state.enabled);
                    // Plugin is now ready to use.
                    if (!state.enabled) {
                        console.log("Start Background Location");
                        BackgroundGeolocation.start();
                    }
                });

                // BackgroundGeolocation.getLog(function (log) {
                //     console.log("Location Log :" + log);
                // });

                // Reg push notification
                this.onRegisterPushNotification();


                if (response.isProfileComplete == "False") {
                    this.routerExtensions.navigate(["user-profile"], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                } else {

                    this.routerExtensions.navigate([""], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                    // this.routerExtensions.navigate(["subscription"], {
                    //     transition: {
                    //         name: "slideLeft"
                    //     },
                    //     clearHistory: true
                    // });
                }

            },
            (error) => {
                // Hide Loading
                this.isLoadingView(false);
                // Show error                
                this.errorMsg(error);
            });
    }

    private onGeofence(geofence: any) {
        var location = geofence.location;
        var identifier = geofence.identifier;
        var action = geofence.action;

        console.log('A geofence has been crossed: ', identifier);
        console.log('ENTER or EXIT?: ', action);
        console.log('geofence: ', JSON.stringify(geofence));

        let geofenceModel = new GeofenceNotificationModel();
        geofenceModel.InterestPointId = geofence.identifier;
        geofenceModel.GeofenceAction = action == "Enter" ? 0 : 1;

        this.loginService.GeofenceNotification(geofenceModel)
            .subscribe((response) => {
                console.log("Geofence Notification response : " + JSON.stringify(response));
            }, (error) => {
                // Show error                
                console.log("Geofence Notification Error : " + JSON.stringify(error));
            });
    }

    private onHttp(response: any) {
        console.log('[event] http: ', response.status, response.responseText);
    }

    private onLocation(location: any) {
        console.log('[event] location: ', JSON.stringify(location));
        // this.location = JSON.stringify(location, null, 2);
        // this.odometer = location.odometer;
        // BackgroundGeolocation.logger.notice('Location received in client');
    }

    private onRegisterPushNotification() {

        let settings = {
            // Android settings 
            senderID: AppSettings.PROJECT_NUMBER, // Android: Required setting with the sender/project number 
            notificationCallbackAndroid: (stringifiedData: string, fcmNotification: any) => {
                console.log("String Data : " + stringifiedData);
                console.log("FCM Notification : " + JSON.stringify(fcmNotification)); 
                                
                // let geofence = JSON.parse(stringifiedData);
                // let geo = JSON.parse(geofence.body);
                // console.log("Data Message : " + JSON.stringify(geo));
                // console.log("Id : " + geo.Id); 
                
                LocalNotifications.hasPermission().then(
                    (granted) => {
                        console.log("Permission granted? " + granted);
                        if(granted){
                            LocalNotifications.schedule([{
                                id: 1,
                                title: 'Interest Point Added',
                                body: " is added",
                                ticker: 'The ticker',
                                badge: 1,
                                // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                                // groupSummary:"Summary of the grouped messages above", //android only
                                ongoing: true, // makes the notification ongoing (Android only)
                                // smallIcon: 'res://heart',
                                // interval: 'minute',
                                // sound: "customsound-ios.wav", // falls back to the default sound on Android
                                at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                            }]).then(
                                () => {
                                    console.log("Notification scheduled");
                                },
                                (error) => {
                                    console.log("scheduling error: " + error);
                                }
                                );
                        }else{
                            LocalNotifications.requestPermission().then((granted) => {
                                if (granted) {
                                    LocalNotifications.schedule([{
                                        id: 1,
                                        title: 'Interest Point Added',
                                        body: " is added",
                                        ticker: 'The ticker',
                                        badge: 1,
                                        // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                                        // groupSummary:"Summary of the grouped messages above", //android only
                                        ongoing: true, // makes the notification ongoing (Android only)
                                        // smallIcon: 'res://heart',
                                        // interval: 'minute',
                                        // sound: "customsound-ios.wav", // falls back to the default sound on Android
                                        at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                                    }]).then(
                                        () => {
                                            console.log("Notification scheduled");
                                        },
                                        (error) => {
                                            console.log("scheduling error: " + error);
                                        }
                                        );
                                }
                            });
                        }
                      
                    }
                );

                // if ("ADD_GEOFENCE" == geofence.title) {
                //     //let geofence = JSON.parse(fcmNotification.getBody());
                //     BackgroundGeolocation.addGeofence({
                //         identifier: geo.Id,
                //         radius: geo.Radius,
                //         latitude: geo.Latitude,
                //         longitude: geo.Longitude,
                //         notifyOnEntry: true,
                //         notifyOnExit: true,
                //         notifyOnDwell: true,
                //         loiteringDelay: 30000,  // 30 seconds
                //     }, () => {
                //         console.log("Successfully added geofence");
                //     }, (error) => {
                //         console.warn("Failed to add geofence", error);
                //     }
                //     );                    

                //     LocalNotifications.hasPermission().then(
                //         (granted) => {
                //             console.log("Permission granted? " + granted);
                //             if(granted){
                //                 LocalNotifications.schedule([{
                //                     id: geo.Id,
                //                     title: 'Interest Point Added',
                //                     body: geo.InterestPointName + " is added",
                //                     ticker: 'The ticker',
                //                     badge: 1,
                //                     // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                     // groupSummary:"Summary of the grouped messages above", //android only
                //                     ongoing: true, // makes the notification ongoing (Android only)
                //                     // smallIcon: 'res://heart',
                //                     // interval: 'minute',
                //                     // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                     at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                 }]).then(
                //                     () => {
                //                         console.log("Notification scheduled");
                //                     },
                //                     (error) => {
                //                         console.log("scheduling error: " + error);
                //                     }
                //                     );
                //             }else{
                //                 LocalNotifications.requestPermission().then((granted) => {
                //                     if (granted) {
                //                         LocalNotifications.schedule([{
                //                             id: geo.Id,
                //                             title: 'Interest Point Added',
                //                             body: geo.InterestPointName + " is added",
                //                             ticker: 'The ticker',
                //                             badge: 1,
                //                             // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                             // groupSummary:"Summary of the grouped messages above", //android only
                //                             ongoing: true, // makes the notification ongoing (Android only)
                //                             // smallIcon: 'res://heart',
                //                             // interval: 'minute',
                //                             // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                             at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                         }]).then(
                //                             () => {
                //                                 console.log("Notification scheduled");
                //                             },
                //                             (error) => {
                //                                 console.log("scheduling error: " + error);
                //                             }
                //                             );
                //                     }
                //                 });
                //             }
                          
                //         }
                //     );

                // }
                // if ("DELETE_GEOFENCE" == geofence.title) {

                //     BackgroundGeolocation.removeGeofence(geo.Id, () => {
                //         console.log("Successfully deleted geofence");
                //     }, (error) => {
                //         console.warn("Failed to delete geofence", error);
                //     }
                //     );
                // }
                // if ("ON_ARRIVE_INTEREST_POINT" == geofence.title) {
                //     //let geofence = JSON.parse(fcmNotification.getBody());

                //     LocalNotifications.hasPermission().then(
                //         (granted) => {
                //             console.log("Permission granted? " + granted);
                //             if(granted){
                //                 LocalNotifications.requestPermission().then((granted) => {
                //                     if (granted) {
                //                         LocalNotifications.schedule([{
                //                             id: geo.Id,
                //                             title: 'Interest Point Arrival Notification',
                //                             body: geo.Message,
                //                             ticker: 'The ticker',
                //                             badge: 1,
                //                             // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                             // groupSummary:"Summary of the grouped messages above", //android only
                //                             ongoing: true, // makes the notification ongoing (Android only)
                //                             // smallIcon: 'res://heart',
                //                             // interval: 'minute',
                //                             // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                             at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                         }]).then(
                //                             () => {
                //                                 console.log("Notification scheduled");
                //                             },
                //                             (error) => {
                //                                 console.log("scheduling error: " + error);
                //                             }
                //                             );
                //                     }
                //                 });
                //             }else{
                //                 LocalNotifications.requestPermission().then((granted) => {
                //                     if (granted) {
                //                         LocalNotifications.schedule([{
                //                             id: geo.Id,
                //                             title: 'Interest Point Arrival Notification',
                //                             body: geo.Message,
                //                             ticker: 'The ticker',
                //                             badge: 1,
                //                             // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                             // groupSummary:"Summary of the grouped messages above", //android only
                //                             ongoing: true, // makes the notification ongoing (Android only)
                //                             // smallIcon: 'res://heart',
                //                             // interval: 'minute',
                //                             // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                             at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                         }]).then(
                //                             () => {
                //                                 console.log("Notification scheduled");
                //                             },
                //                             (error) => {
                //                                 console.log("scheduling error: " + error);
                //                             }
                //                             );
                //                     }
                //                 });
                //             }
                          
                //         }
                //     );

                    
                // }
                // if ("ON_LEAVE_INTEREST_POINT" == geofence.title) {
                //     //let geofence = JSON.parse(fcmNotification.getBody());

                //     LocalNotifications.hasPermission().then(
                //         (granted) => {
                //             console.log("Permission granted? " + granted);
                //             if(granted){
                //                 LocalNotifications.schedule([{
                //                     id: geo.Id,
                //                     title: 'Interest Point Leave Notification',
                //                     body: geo.Message,
                //                     ticker: 'The ticker',
                //                     badge: 1,
                //                     // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                     // groupSummary:"Summary of the grouped messages above", //android only
                //                     ongoing: true, // makes the notification ongoing (Android only)
                //                     // smallIcon: 'res://heart',
                //                     // interval: 'minute',
                //                     // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                     at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                 }]).then(
                //                     () => {
                //                         console.log("Notification scheduled");
                //                     },
                //                     (error) => {
                //                         console.log("scheduling error: " + error);
                //                     }
                //                     );
                //             }else{
                //                 LocalNotifications.requestPermission().then((granted) => {
                //                     if (granted) {
                //                         LocalNotifications.schedule([{
                //                             id: geo.Id,
                //                             title: 'Interest Point Leave Notification',
                //                             body: geo.Message,
                //                             ticker: 'The ticker',
                //                             badge: 1,
                //                             // groupedMessages:["The first", "Second", "Keep going", "one more..", "OK Stop"], //android only
                //                             // groupSummary:"Summary of the grouped messages above", //android only
                //                             ongoing: true, // makes the notification ongoing (Android only)
                //                             // smallIcon: 'res://heart',
                //                             // interval: 'minute',
                //                             // sound: "customsound-ios.wav", // falls back to the default sound on Android
                //                             at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                //                         }]).then(
                //                             () => {
                //                                 console.log("Notification scheduled");
                //                             },
                //                             (error) => {
                //                                 console.log("scheduling error: " + error);
                //                             }
                //                             );
                //                     }
                //                 });
                //             }
                          
                //         }
                //     );

                    
                // }
            },
            // iOS settings 
            badge: true, // Enable setting badge through Push Notification 
            sound: true, // Enable playing a sound 
            alert: true, // Enable creating a alert 

            // Callback to invoke, when a push is received on iOS 
            notificationCallbackIOS: (message) => {
                console.log(JSON.stringify(message));
                //alert(JSON.stringify(message));
            }
        };
        // Show Loading
        this.isLoadingView(true);

        pushPlugin.register(settings,
            // Success callback 
            (token) => {
                // Hide Loading
                this.isLoadingView(false);

                // Save push notification token on Server
                let regToken = new RegisterPushNotification();
                regToken.PushNotificationToken = token;

                // Show Loading
                this.isLoadingView(true);
                this.loginService.RegisterPushNotification(regToken).subscribe((response) => {

                    // if we're on android device we have the onMessageReceived function to subscribe
                    // for push notifications
                    if (pushPlugin.onMessageReceived) {
                        pushPlugin.onMessageReceived(settings.notificationCallbackAndroid);
                    }

                    // Hide Loading
                    this.isLoadingView(false);

                },
                    (error) => {
                        // Hide Loading
                        this.isLoadingView(false);
                        // Show error                
                        this.errorMsg(error);
                    });

            },
            // Error Callback 
            (error) => {
                // Hide Loading
                this.isLoadingView(false);
                // Show error                
                this.errorMsg(error);
            }
        );

        // onMessageReceived(function callback(stringifiedData, fcmNotification) {
        //     var notificationBody = fcmNotification && fcmNotification.getBody();
        //     alert("Message received!\n" + notificationBody + "\n" + stringifiedData);
        // });
    }

    private onActivityChange(event: any) {
        console.log('[event] activitychange: ', event.activity, event.confidence);
        if (event.activity == "in_vehicle" || event.activity == "on_bicycle") {
            // Send local notification to user that he is travelling
            LocalNotifications.requestPermission().then((granted) => {
                if (granted) {
                    LocalNotifications.schedule([{
                        id: 1,
                        title: "You are travelling",
                        body: "",
                        ongoing: true, // makes the notification ongoing (Android only)
                        at: new Date(new Date().getTime() + (10 * 1000)) // 10 seconds from now
                    }]).then(() => {
                        console.log("Notification scheduled!");
                        // Toast.makeText("Notification scheduled!").show();
                    }, (error) => {
                        console.log("Error : " + error);
                        // console.dir(error);
                    });
                }
            });
        } else {
            LocalNotifications.cancel(1).then(
                (foundAndCanceled) => {
                    if (foundAndCanceled) {
                        console.log("OK, it's gone!");
                    } else {
                        console.log("No ID 1 was scheduled");
                    }
                }
            );
        }
    }
}