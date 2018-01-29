import { Injectable } from "@angular/core";

import { isAndroid } from "platform";

import * as connectivity from "connectivity";
import * as permissions from "nativescript-permissions";

declare var android: any

@Injectable()
export class NoInternetService {
    isOnline = false;
    constructor() { }

    public checkConnection() {
        if (isAndroid) {
            permissions.requestPermission(android.Manifest.permission.ACCESS_NETWORK_STATE, "I need these permissions because I'm cool")
                .then(() => {
                    console.log("Permission Granted!");
                    switch (connectivity.getConnectionType()) {
                        case connectivity.connectionType.none:
                            this.isOnline = false;
                            console.log("none");
                            break;
                        case connectivity.connectionType.wifi:
                            this.isOnline = true;
                            console.log("wifi");
                            break;
                        case connectivity.connectionType.mobile:
                            this.isOnline = true;
                            console.log("mobile");
                            break;
                        default:
                            this.isOnline = true;
                            break;
                    }
                })
                .catch(() => {
                    console.log("Permission Denied!");
                    return this.isOnline = false;

                });

        }
        else {
            switch (connectivity.getConnectionType()) {
                case connectivity.connectionType.none:
                    this.isOnline = false;
                    console.log("none");
                    break;
                case connectivity.connectionType.wifi:
                    this.isOnline = true;
                    console.log("wifi");
                    break;
                case connectivity.connectionType.mobile:
                    this.isOnline = true;
                    console.log("mobile");
                    break;
                default:
                    break;
            }
            return this.isOnline;
        }
    }
}