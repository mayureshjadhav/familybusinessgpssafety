import { Injectable } from "@angular/core";
import * as appSettings from "application-settings";

export class Auth {
	token: string;
	userId: string;
	userName: string;
	refreshToken: string;
	role: string;
}

@Injectable()
export class AuthStore {

	AUTH_STRING: string = "o-auth";

	constructor() {
	}

	save(auth: Auth): void {
		appSettings.setString(this.AUTH_STRING, JSON.stringify(auth));
	}

	get(): Auth {
		try {
			  if (appSettings.getString(this.AUTH_STRING) !== undefined) {
				return JSON.parse(appSettings.getString(this.AUTH_STRING));
			  }
			  else{
				  return null;
			  }
		} catch (error) {
			return null;
		}
	}

	remove(): void {
		appSettings.remove(this.AUTH_STRING);
	}
}