import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";


@Injectable()
export class InterestPointsService {
  constructor(private http: CustomHttpService) { }

  getInterestPoints(groupId, startIndex) {
    let url = stringFormat(APIMethod.GET_INTEREST_POINTS, groupId, startIndex, 10);
    return this.http.get(url);
  }
}