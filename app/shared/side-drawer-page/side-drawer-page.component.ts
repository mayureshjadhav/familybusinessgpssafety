import { Component, ViewChild, AfterViewInit, NgZone, OnDestroy } from "@angular/core";

import { isAndroid, isIOS } from "platform";
import { PushTransition, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { RouterExtensions } from "nativescript-angular/router";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-pro-ui/sidedrawer/angular";

import { ActionItem } from "ui/action-bar";
import { Page } from "ui/page";
// import tempview = require("ui/core/view");

import { Auth, AuthStore } from "../../core/storage/auth-storage";

@Component({
  selector: "side-drawer-page",
  moduleId: module.id,
  templateUrl: "./side-drawer-page.component.html",
  styleUrls: ["./side-drawer-page.component.css"]
})
export class SideDrawerPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild(RadSideDrawerComponent) drawerComponent: RadSideDrawerComponent;

  /**
   * On tap of any side-drawer item, hiding content if this flag is true.
   */
  isContentVisible: boolean = true;

  /**
   * For android using SlideOnTop transition and for iOS, push transition.
   */
  drawerTransition: any;

  /**
  * Navigation Menu
  */
  navMenu: any[] = [
    { name: "Home", commands: [""], path: "" },
    { name: "Invitations", commands: [""], path: "invitations" },
    { name: "Logout", commands: [""], path: "login" }
  ];

  public drawer: SideDrawerType;

  auth: Auth;

  constructor(
    private routerExtensions: RouterExtensions,
    private page: Page,
    private ngZone: NgZone,
    private authStore: AuthStore
  ) {
    this.setActionBarIcon(this.page);
    this.setDrawerTransition();

  }

  ngAfterViewInit() {
    this.drawer = this.drawerComponent.sideDrawer;
  }

  ngOnDestroy() {
    this.drawer.off('drawerClosed');
  }

  toggleSideDrawer() {
    this.drawer.toggleDrawerState();
  }

  /**
     * Navigates to next page after drawer is closed.
     */
  navigateToUrl(routeCommands: string) {
    console.log("Url : " + routeCommands);
    this.drawer.closeDrawer();
    this.isContentVisible = false;


    this.drawer.on('drawerClosed', () => {
      this.ngZone.run(() => {

        if (routeCommands === "login") {
          // Get previous username
          this.auth = this.authStore.get();

          // Remove values from application settings
          this.authStore.remove();
          setTimeout(() =>
            this.routerExtensions.navigate(["login"],
              {
                clearHistory: true,
                animated: false
              }));
        }
        else {
          setTimeout(() =>
            this.routerExtensions.navigate([routeCommands],
              {
                transition: {
                  name: "slideLeft"
                }
              }));
        }

        this.isContentVisible = true;
      });
    });

  }

  private setDrawerTransition() {
    if (isAndroid) {
      this.drawerTransition = new SlideInOnTopTransition();
    }

    if (isIOS) {
      this.drawerTransition = new PushTransition();
    }
  }

  private setActionBarIcon(page: Page) {
    if (isAndroid) {
      //page.actionBar.navigationButton = this.getNavigationButton();
      page.actionBar.actionItems.addItem(this.getNavigationButton());
    }

    if (isIOS) {
      page.actionBar.actionItems.addItem(this.getNavigationButton());
    }
  }

  private getNavigationButton() {
    let navActionItem = new ActionItem();

    navActionItem.icon = "res://ic_menu_white";
    if (navActionItem.ios) {
      navActionItem.ios.position = 'right';
    }
    navActionItem.on('tap', this.toggleDrawer.bind(this));
    return navActionItem;
  }

  public toggleDrawer() {
    this.drawer.toggleDrawerState();
  }
}
