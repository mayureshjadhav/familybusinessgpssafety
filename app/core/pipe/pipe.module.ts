import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { ImageCachePipe } from "./image-cache.pipe";


@NgModule({
  imports: [
    NativeScriptModule
  ],
  declarations: [
    ImageCachePipe,
  ],
  exports: [
    ImageCachePipe
  ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class PipeModule {

}
