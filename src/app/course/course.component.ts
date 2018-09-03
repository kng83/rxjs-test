import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course} from '../model/course';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap, tap} from 'rxjs/operators';
import {forkJoin, fromEvent, Observable} from 'rxjs';
import {Lesson} from '../model/lesson';
import {createHttpObservable} from '../common/util';
import {debug, RxJsLoggingLevel, setRxJsLoggingLevel} from '../common/debug';


@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;
  courseId: string;

  // tutaj przechwytujemy wartosci z inputa(search)
  @ViewChild('searchInput') input: ElementRef;

  constructor(private route: ActivatedRoute) {


  }

  // chcemy aby w naszym search pojawila sie lista kursow
  ngOnInit() {

    this.courseId = this.route.snapshot.params['id'];

    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`)
      .pipe(
        debug(RxJsLoggingLevel.INFO, 'course Value')
      );

    // sprawdzamy operator forkJoin ktory daje nam obeservable
    // po dostarczeniu wszystkich observable
    // w forku otrzymujemy tuple na wyjsciu
    // tuple dostajemy gdy 2 observable sie zakonczyly
    const lessons$ = this.loadLessons();
    forkJoin(this.course$, lessons$)
      .pipe(
        tap(([course, lessons]) => {
          console.log(course, lessons);
        })
      ).subscribe();

    // zwiekszamy poziom logowania na maoment
    setRxJsLoggingLevel(RxJsLoggingLevel.DEBUG);
  }

  // najpierw damy debounceTime aby zmniejszyc liczbe emisji keyup
  // distinctUntilChanged omija nam duplikaty
  // debaunceTime daja nam okno czasowe na zmiane
  // swichMap pozwoli nam uniknac nadmiernych requesto np. jak
  // uzytkownik cos pisze i dopisze litere to bedzie zadanie kasowane
  // i bedzie wysylane nowe zadanie a stare zostanie unsubskrybowane
  // robimy przebudowe i zamiast concata dajemy startWith i tam dajemy ''
  // czyli przejdziemy przez ta observable raz damy '' i bedziemy mieli efekt
  // jak w wersji z concatem
  // roznica miedzy debounce a throttling
  // debonce gdy input gdzie user pisze jest stabilny np przez czas 400ms
  // throttle bierze wartosci i co jakis interwal zwraca observable
  // ponoc dobre do websocketas


  ngAfterViewInit() {

    this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        startWith(''),
        debug(RxJsLoggingLevel.TRACE, 'search'),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(search => this.loadLessons(search)),
        debug(RxJsLoggingLevel.DEBUG, 'lessons value')
      );

    // fromEvent<any>(this.input.nativeElement, 'keyup')
    //   .pipe(
    //     map(event => event.target.value),
    //     // startWith(''),
    //     // debounceTime(400),
    //     throttleTime(500) // to samo co to throttle(() => interval(500))
    //   ).subscribe(console.log);

  }

  loadLessons(search = ''): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
      .pipe(
        map(res => res['payload'])
      );
  }


}

// stara dobra werja sercha ktora dziala z uzyciem concat na dwa strumienie
// ngAfterViewInit() {
//   const searchLessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
//     .pipe(
//       map(event => event.target.value),
//       debounceTime(400),
//       distinctUntilChanged(),
//       switchMap(search => this.loadLessons(search))
//     );
//
//   // robimy liste lekcji ktora takze jest observable
//   // musimy polaczyc 2 observable aby najpierw wyswietlic wszystkie lekcje a pozniej
//   // zastosowac filtr
//   const initialLessons$ = this.loadLessons();
//
//   this.lessons$ = concat(initialLessons$, searchLessons$);
// }
