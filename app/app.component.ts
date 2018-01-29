import { Component } from "@angular/core";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);
registerElement("PullToRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);
// Important - must register MapView plugin in order to use in Angular templates
registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent { }
