import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {concat, fromEvent, interval, noop, Observable, of, timer} from 'rxjs';
import {createHttpObservable} from '../common/util';
import {map} from 'rxjs/operators';


@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    // robimy laczenie strumieni concat
    // najpierw bedzie 1 strumien potem drugi
    // pierwszy strumien musi byc completed aby drugi zaczal dzialac
    // completed jest najwazniejszy w of
    const source1$ = of(1, 2, 3);
    const source2$ = of(4, 5, 6);
    const source4$ = interval(1000); // to nigdy sie nie skonczy i source3$ nie bedzie ukonczony
    const source3$ = of(7, 8, 9);

    const result$ = concat(source1$, source2$, source4$, source3$);
    result$.subscribe(value => console.log(value));
  }

  backup2() {

    const http$ = createHttpObservable('/api/courses');

    // uzywamy pipe operator tam wsadzamy map i dajemy Object.values
    // aby otrzymac tablice
    const courses$ = http$
      .pipe(
        map(res => Object.values(res['payload']))
      );


    courses$.subscribe(
      courses => console.log(courses),
      noop, // rxjs function for no operation ()=>{} to jest to
      () => console.log('completed')
    );

    http$.subscribe(
      courses => console.log(courses),
      noop, // rxjs function for no operation ()=>{} to jest to
      () => console.log('completed')
    );
  }

  backup() {
    const interval$ = interval(1000);
    // interval$.subscribe(val => console.log('stream 1 => ' + val));
    //  interval$.subscribe(val => console.log('stream 2 => ' + val));

    // zaczynamy po 3 sekundach a poterm interval 1000
    const timmer$ = timer(3000, 1000);
    const sub = timmer$.subscribe(val => console.log('stream 1 => ' + val));

    // unsubskrybowanie po 5 sekundach
    setTimeout(() => sub.unsubscribe(), 5000);


    // subskrybowanie klikniecia
    const click$ = fromEvent(document, 'click');
    click$.subscribe(
      evt => console.log(evt),
      err => console.log(err),
      () => console.log('completed'));
  }
}

// dajemy ja do util file
// function createHttpObservable(url: string) {
//   // tworzymy observable i wsadzamy do niej funkcje fetch
//   // dzieki temu robimy strumien observable
//   return Observable.create(observer => {
//     fetch(url)
//       .then(response => {
//         return response.json();
//       })
//       .then(body => {
//         observer.next(body);
//         observer.complete(); // aby nie emitowac wiecej
//       })
//       .catch(err => {
//         observer.error(err);
//       });
//   });
// }



