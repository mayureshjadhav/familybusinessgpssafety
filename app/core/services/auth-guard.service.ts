import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRoute } from "@angular/router";

import { RouterExtensions } from "nativescript-angular/router";

import { AuthStore } from "./../storage/auth-storage"


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private routerExtensions: RouterExtensions, private authStore: AuthStore) {
  }

  canActivate() {    
    if (this.authStore.get() != undefined || this.authStore.get() != null) {
      return true;
    }
    else {
      this.routerExtensions.navigate(["login"], {
        clearHistory: true, transition: {
          name: "slideLeft"
        }
      });
      return false;
    }
  }
}

