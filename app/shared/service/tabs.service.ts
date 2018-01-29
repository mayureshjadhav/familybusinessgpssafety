import { Injectable } from "@angular/core";

import { TABS } from "./mock.tabs";

@Injectable()
export class TabsService {

  getTabs() {
    return Promise.resolve(TABS);
  }
  
}