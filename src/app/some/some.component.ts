import {Component, OnInit} from '@angular/core';
import {interval, merge} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'some',
  templateUrl: './some.component.html',
  styleUrls: ['./some.component.scss']
})
export class SomeComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    // sprawdzamy merge jest to rownolegle subskrybowanie
    // na wyjsciu mamy na przemian 1,10,2,20,3,30
    const interval1$ = interval(1000);
    const interval2$ = interval1$.pipe(map(val => 10 * val));
    const result$ = merge(interval1$, interval2$);
    result$.subscribe(console.log);
  }

}
