import {Component, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {createHttpObservable} from '../common/util';

@Component({
  selector: 'cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent implements OnInit {

  constructor() {
  }

  // Testujemy unsubskrybowanie
  ngOnInit() {
    const interval1$ = interval(1000);
    const sub = interval1$.subscribe(console.log);

    setTimeout(() => {
        sub.unsubscribe();
      },
      5000);


    // testujemy to unsubscrybowanie ktore zostalo zaimplementowane w
    // w module util.ts. Jak damy 0ms to nie otrzymamy odpowiedzi
    // bo pobranie zadania zostanie cancelowane
    const http$ = createHttpObservable('/api/courses');
    const sub2 = http$.subscribe(console.log);


    setTimeout(() => {
      sub2.unsubscribe();
    }, 0);
  }

}
