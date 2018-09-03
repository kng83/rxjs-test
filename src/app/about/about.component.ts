import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {
  concat,
  fromEvent,
  interval,
  noop,
  observable,
  Observable,
  of,
  timer,
  merge,
  Subject,
  BehaviorSubject,
  AsyncSubject,
  ReplaySubject
} from 'rxjs';
import {delayWhen, filter, map, take, timeout} from 'rxjs/operators';
import {createHttpObservable} from '../common/util';


@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  ngOnInit() {

    // w AsyncSubject() emitowane jest ostatnia wartosc przed complete
    // gdy nie ma complete to brak wartosci. Jesli bedzie opoznienie czasowe
    // w setTimeout to rowniez ta opozniona subskrypcja dojdzie
    // jesli chcemy aby kompletna observable dotarla do opoznienia
    // to dajemy ReplaySubject(),
    // w ReplaySubject nie musimy dawac complete

   // const subject = new AsyncSubject();
    const subject = new ReplaySubject();


    const series$ = subject.asObservable();
    series$.subscribe(value => console.log('early subsciption', value));

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete(); // musi byc w async a nie musi byc replay
    //

    setTimeout(() => {
      series$.subscribe(value => console.log('late subsciption', value));
      subject.next(4); // to nie dojdzie
    }, 3000);


  }


}





function BehavioreSubject() {

  // const subject = new Subject();
  // BehaviorSubject musi miec wartosc startowa
  const subject = new BehaviorSubject(0);


  // aby nie pracowac na subjecie robimy z niego Observable
  // dzieki temu mozemy subskrybowac ale nie mozemy emitowac
  // wazne ze metoda next jest deklarowana po subskrybowaniu
  // zwykly subject nie ma pamieci a BehavioralSubject ja ma
  // jesli damy w BehavioreSubject compelte to pozna subskrypcja nic
  // nie dostanie a tak dostanie 3

  const series$ = subject.asObservable();
  series$.subscribe(value => console.log('early subsciption', value));

  subject.next(1);
  subject.next(2);
  subject.next(3);
  // subject.complete();


  // testujemy pozna subskrypcje
  // niedostajemy dla zwyklego Subject wartosc bo on nie pamieta
  // wartosci. Dostaniemy najperw wartosc lat 3 z poprzedniego subjecta
  setTimeout(() => {
    series$.subscribe(value => console.log('late subsciption', value));
    subject.next(4);
  }, 3000);


}






