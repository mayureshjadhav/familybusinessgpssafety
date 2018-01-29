import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";


@Injectable()
export class ViewInterestPointService {
  constructor(private http: CustomHttpService) { }

  get(interestPointId) {
    let url = stringFormat(APIMethod.GET_INTEREST_POINT, interestPointId);
    return this.http.get(url);
  }

  delete(interestPoint) {
    return this.http.post(APIMethod.DELETE_INTEREST_POINT, interestPoint);
  }

}