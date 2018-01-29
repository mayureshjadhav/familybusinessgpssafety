import { Pipe, PipeTransform, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ImageSource, fromResource } from 'image-source';
import { Cache } from 'ui/image-cache';

import { isFileOrResourcePath, isDataURI } from 'utils/utils';

let cache = new Cache();
cache.placeholder = fromResource('placeholder');

cache.enableDownload();

/**
 * Use:
 * <Image src="'http://image.url.at.domain.tld/sub/path.jpg' | imageCache | async"></Image>
 */

@Pipe({
  name: 'imageCache'
})
export class ImageCachePipe implements PipeTransform {
  constructor(private ngZone: NgZone) {
  }

  transform(imageUrl: string, usePlaceholder = true): Observable<ImageSource | string> {
    if (isFileOrResourcePath(imageUrl) || isDataURI(imageUrl)) {
      return Observable.of(imageUrl);
    }

    let image = cache.get(imageUrl);
    if (image) {
      return Observable.of(image);
    }

    return Observable
      .create((observer) => {
        if (cache.placeholder && usePlaceholder) {
          observer.next(cache.placeholder);
        }

        cache.push({
          key: imageUrl,
          url: imageUrl,
          completed: (image: any, key: string) => {
            if (key === imageUrl) {
              this.ngZone.run(() => {
                observer.next(image);
                observer.complete();
              });
            }
          },
        });
      });
  }
};