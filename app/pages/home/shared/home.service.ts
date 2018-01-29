import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";


@Injectable()
export class HomeService {
  constructor(private http: CustomHttpService) { }

  getAllGroups() {    
    return this.http.get(APIMethod.GET_ALL_GROUPS);
  } 
}

