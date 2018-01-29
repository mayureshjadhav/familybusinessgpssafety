import { Injectable } from "@angular/core";

//import { SnackBar } from "nativescript-snackbar";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";

@Injectable()
export class SnackbarMessageService {
    private _snackbar: Feedback;

    constructor() {
        this._snackbar = new Feedback();
    }

    public error(error: string): void {
        this._snackbar.show({
            message: error,
            position:FeedbackPosition.Top
        });
    }

    public info(message: string) {
        this._snackbar.show({
            message: message,
            position:FeedbackPosition.Top
        });
    }
}