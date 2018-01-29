import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import "rxjs/add/operator/share";

export class ErrorNotifierService {
  private errorObservable: Observable<any>;
  private errorObserver: Observer<any>;

  constructor() {
    this.errorObservable = Observable.create((observer: Observer<any>) => {
      this.errorObserver = observer;
    }).share();
  }

  notifyError(error: any) {
    this.errorObserver.next(error);
  }

  onError(callback: (err: any) => void) {
    this.errorObservable.subscribe(callback);
  }
}