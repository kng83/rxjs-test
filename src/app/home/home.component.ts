import {Component, OnInit} from '@angular/core';
import {Course} from '../model/course';
import {interval, noop, Observable, of, throwError, timer} from 'rxjs';
import {catchError, delayWhen, finalize, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import {createHttpObservable} from '../common/util';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // zmieniamy nasze tablice na observable
  // bedziemy mieli teraz strumienie danych
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;


  ngOnInit() {


    const http$ = createHttpObservable('/api/courses');

    // uzywamy pipe operator tam wsadzamy map i dajemy Object.values
    // aby otrzymac tablice
    // najpierw robimy dwa zapytania do backendu
    // trzeba uzyc shareReplay operator
    // shareReplay jest uzywany by nastepne subksrybje dotyczyly tego samego watku
    // zmniejsza to ilosc potrzebnych zasobow
    // catchError daje nam alternatywna observable do uzycia zamiast
    // bledu tak by mozna bylo dalej kierowac strumieniem
    // mozemy dac  catchError(err => of([wartosc zastepcza]) i wtedy
    // dalej bedzie kontynuowana na wartosci zastepczej
    // zmenielismy funckje w utlity aby zwracala nam error przy kodzie 500
    // dodajemy finalize ktora moze byc wykonywana dla 2 przypadkow
    // jak catchError dajemy na gore to mamy 1 blad w konsoli nie 2
    // finalize jest wykonywana 2 razy bo mamy 2 subskrybcje ponizej
    // stara wersja bledu na koncu kodu
    // aby powtorzyc bledny request zostanie tu zastosowany retry operator
    // po kazdym errorze czekamy 2 sekundy aby ponowic zadanie do serwera
    // retryWhen pozwala nam powielic np zapytanie do serwera

    const courses$: Observable<Course[]> = http$.pipe(
      tap(() => console.log('Http executed')),
      map(res => Object.values(res['payload'])),
      shareReplay(),
      retryWhen(err => err.pipe(
        tap(() => console.log(err)),
        delayWhen(() => timer(2000))
      ))
    );


    this.beginnerCourses$ = courses$
      .pipe(
        map(courses => courses
          .filter(course => course.category === 'BEGINNER'))
      );

    this.advancedCourses$ = courses$
      .pipe(
        map(courses => courses
          .filter(course => course.category === 'ADVANCED'))
      );

  }

}

// ********To jest rozwiazanie imperatywne
// export class HomeComponent implements OnInit {
//
//   beginnerCourses: Course[];
//   advancedCourses: Course[];
//
//
//   ngOnInit() {
//
//
//     const http$ = createHttpObservable('/api/courses');
//
//     // uzywamy pipe operator tam wsadzamy map i dajemy Object.values
//     // aby otrzymac tablice
//     const courses$ = http$
//       .pipe(
//         map(res => Object.values(res['payload']))
//       );
//
//
//     // to tutaj to rozwiazanie imperatywne
//     courses$.subscribe(
//       courses => {
//         this.beginnerCourses = courses
//           .filter(course => course.category === 'BEGINNER');
//
//         this.advancedCourses = courses
//           .filter(course => course.category === 'ADVANCED');
//       },
//       noop, // rxjs function for no operation ()=>{} to jest to
//       () => console.log('completed')
//     );
//
//   }
//
// }


// stara wersja bledu z catch
// const courses$: Observable<Course[]> = http$.pipe(
//   catchError(err => {
//     console.log('Error occurred', err);
//     return throwError(err);
//   }),
//   finalize(() => {
//     console.log('finalize');
//   }),
//   tap(() => console.log('Http executed')),
//   map(res => Object.values(res['payload'])),
//   shareReplay()
// );
