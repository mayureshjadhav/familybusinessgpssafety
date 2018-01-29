import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { SIDEDRAWER_DIRECTIVES, NativeScriptUISideDrawerModule } from "nativescript-pro-ui/sidedrawer/angular";

import { SideDrawerPageComponent } from "./side-drawer-page";

// import { MinLengthDirective, IsEmailDirective, IsLetterDirective, MaxLengthDirective } from "./directive/input.directive";

@NgModule({
  imports: [
    NativeScriptModule,
    // Added for AOT compilation
    NativeScriptUISideDrawerModule
  ],
  declarations: [
    //SIDEDRAWER_DIRECTIVES,
    SideDrawerPageComponent
  ],
  exports: [
    SideDrawerPageComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class SharedModule {

}
