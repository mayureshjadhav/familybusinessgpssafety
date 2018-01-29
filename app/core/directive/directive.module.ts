import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { ControlMessagesComponent  } from "./control-messages.component";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptModule
    ],
    declarations: [ControlMessagesComponent],
    exports: [ControlMessagesComponent]
})
export class DirectiveModule { }