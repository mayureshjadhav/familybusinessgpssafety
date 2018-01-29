import { Injectable } from "@angular/core";
import { Http, RequestOptions, RequestOptionsArgs, Headers, RequestMethod } from "@angular/http";
 import { Observable } from "rxjs/Rx";
//import { Observable } from "rxjs/Observable";

import { ErrorNotifierService } from "./error-notifier";

import { AuthStore } from "./storage/auth-storage"

import { AppSettings } from "../shared/app.constants";

@Injectable()
export class CustomHttpService {
  baseUrl: string = AppSettings.API_ENDPOINT;

  constructor(private http: Http,
    private errorService: ErrorNotifierService, private authStore: AuthStore) {
  }


  private requestMethod(url: string, options?: RequestOptionsArgs, body?: any): Observable<any> {
    var initialUrl = url;
    console.log('initial url:' + initialUrl);
    // Update the Header
    this.interceptor(url, options, body);
    url = this.baseUrl + url;
    console.log('URl :' + url);
    options.url = url;

    return this.http.request(url, options)
      .catch((err: any): any => {
        console.log("Err : " + err);
        return this.handleError(err, initialUrl, options, body);
      })
      .finally(() => {

        console.log('Finally... :' + initialUrl);
      });
  }

  get(url: string, options?: RequestOptionsArgs): Observable<any> {
    if (options == null) {
      let headers = new Headers();
      options = new RequestOptions({
        method: RequestMethod.Get,
        headers: headers
      });
    }

    let res = this.requestMethod(url, options);
    console.log("Get Result");

    return this.commonResponse(res);
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    console.log('Before the post...');
    if (options == null) {
      let headers = new Headers();

      if (url != "/token") {
        options = new RequestOptions({
          method: RequestMethod.Post,
          headers: headers,
          body: (body != undefined) ? JSON.stringify(body) : ''
        });
      }
      else {
        options = new RequestOptions({
          method: RequestMethod.Post,
          headers: headers,
          body: (body != undefined) ? body : ''
        });
      }


    }

    console.log("Body :" + options.body);

    let res = this.requestMethod(url, options);

    console.log("Post Result");

    return this.commonResponse(res);
  }

  commonResponse(observable: Observable<any>): any {
    let result: Observable<any> = observable;
    return result.map(resp => {
      return resp.json();
      // if (resp.json()) {
      //   console.log('Result : '+ JSON.stringify(resp.json()));
      //   return resp.json();
      // }
      // else {
      //   console.log('Result1 : '+ resp);
      //   return resp;
      // }

    });
  }

  interceptor(url: string, options?: RequestOptionsArgs, body?: any) {
    let initialUrl = url;
    let headers = options.headers || new Headers();
    let cr = this.authStore.AUTH_STRING;

    // if (cr != null) {
    var credentials = this.authStore.get();
    if (credentials != null) {
      // Add token to the header if already exits      
      console.log('Token' + credentials.token);

      headers.set("Content-Type", "application/json");
      headers.set("Authorization", "Bearer " + credentials.token);
      options.headers = headers;
    }
    else {
      if (initialUrl == "/token") {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      }
      else {
        headers.set("Content-Type", "application/json");
      }
      options.headers = headers;
    }
    // }
    // else {
    //   if (initialUrl == "/token") {
    //     headers.set("Content-Type", "application/x-www-form-urlencoded");
    //   }
    //   else {
    //     headers.set("Content-Type", "application/json");
    //   }
    //   options.headers = headers;
    // }

    console.log("Intercept End");
  }

  handleError(err: any, initialUrl: string, options?: RequestOptionsArgs, body?: any): Observable<any> {
    let error = JSON.parse(JSON.stringify(err));

    console.log("Error Handler - " + JSON.stringify(err));

    if (error.status === 400 || error.status === 422) {
      return Observable.throw(error._body);

    } else if (error.status === 500) {
      return Observable.throw("Server Error");
    }
    else if (error.status === 405) {
      return Observable.throw(error._body);
    }
    else if (error.status === 401) {
      console.log('CustomHttpService 401');
      console.log('custom http 401 refresh token code');
      console.log("AuthStore :" + JSON.stringify(this.authStore.get()));
      // Get previous auth data
      if (this.authStore.get() != null) {
        // If auth data exits, call refresh token api to receive new token
        let refreshToken = this.authStore.get().refreshToken;
        console.log('refreshToken : ' + refreshToken);
        let headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        let opt = new RequestOptions({
          url: this.baseUrl + "/token",
          method: RequestMethod.Post,
          headers: headers,
          body: "grant_type=" + AppSettings.GRANT_TYPE_REFRESHPASSWORD + "&refresh_token=" + refreshToken + "&client_id=" + AppSettings.CLIENT_ID
        });

        console.log('Body : ' + opt.body);

        // Refresh Token API call
        return this.http.request(this.baseUrl + "/token", opt).flatMap(response => {
          var obj = response.json();
          console.log('refresh response' + JSON.stringify(obj));
          // Saved newly received refresh token
          let auth = this.authStore.get();
          auth.refreshToken = obj.refresh_token;
          auth.token = obj.access_token;
          this.authStore.save(auth);
          //Call initial api again after receiveing the new token                   
          return this.requestMethod(initialUrl, options, body);
        })
          .catch((err: any): any => {
            // If error occured on refresh token api call remove previous auth details
            this.authStore.remove();
            // notify to controller to redirect to user to login page
            this.errorService.notifyError(err);
            return Observable.empty();
          })
          .finally(() => {
            console.log('Finally...');
          });
      } else {
        // If previous auth data not found notify the user and redirect him to login screen
        this.errorService.notifyError(error);
        return Observable.empty();
      }
    }
    else {
      this.errorService.notifyError(error);
      return Observable.empty();
    }
  }


  /**
 * True of the response content type is JSON.
 */
  private isJson(value: Response): boolean {
    return /\bapplication\/json\b/.test(value.headers.get('Content-Type'));
  }
}
