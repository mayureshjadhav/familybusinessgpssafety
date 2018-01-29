import { Injectable } from "@angular/core";

import { TABS } from "./tabs.mock";

@Injectable()
export class TabsService {

  getTabs() {
    return Promise.resolve(TABS);
  }
  
}