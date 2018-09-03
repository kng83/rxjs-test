// robimy funkcje do debug aby pominac te wszystkie tap
// musimy zrobic higher order function poniewaz naszym wyjsciem z
// pipe bedzie nastepna observable

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';


export enum RxJsLoggingLevel {
  TRACE,
  DEBUG,
  INFO,
  ERROR

}

let rxjsLoggingLevel = RxJsLoggingLevel.INFO;

// robimy dostep do zmieniej globalnej aby ustawic ja na poziom logowania
export function setRxJsLoggingLevel(level: RxJsLoggingLevel) {
  rxjsLoggingLevel = level;
}

export const debug = (level: number, message: string) =>
  (source: Observable<any>) => source
    .pipe(
      tap(val => {
        if (level >= rxjsLoggingLevel) {
          console.log(message + ': ' , val);
        }
      })
    );

