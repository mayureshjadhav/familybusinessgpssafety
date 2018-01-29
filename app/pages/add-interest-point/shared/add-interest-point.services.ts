import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";


@Injectable()
export class AddInterestPointService {
  constructor(private http: CustomHttpService) { }

  addInterestPoint(interestPoint) {
    return this.http.post(APIMethod.ADD_INTEREST_POINT, interestPoint);
  }
}

