import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course} from '../model/course';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll, shareReplay, first, take
} from 'rxjs/operators';
import {merge, fromEvent, Observable, concat, forkJoin} from 'rxjs';
import {Lesson} from '../model/lesson';
import {createHttpObservable} from '../common/util';
import {Store} from '../common/store.service';


@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

  courseId: number;

  course$: Observable<Course>;

  lessons$: Observable<Lesson[]>;


  @ViewChild('searchInput') input: ElementRef;

  constructor(private route: ActivatedRoute, private store: Store) {
  }

  ngOnInit() {

    this.courseId = this.route.snapshot.params['id'];

    // trzeba uwazac bo bedziemy caly czas tworzyc observable bo one nie beda sie
    // konczyc. Uzywa sie first zeby otrzymac pierwsza albo take
    // mozemy brac take(1) lub first
    this.course$ = this.store.selectCourseById(this.courseId)
      .pipe(
        tap(() => console.log('herere')),
        take(1)
      );

    // nic tutaj nie dostajemy w konsoli bo forkJoin czeka na ukonczenie Observable
    forkJoin(this.course$, this.loadLessons())
      .subscribe(console.log);

    // withLatestFrom laczy na observable z jednego strumienia z najnowsza observable
    // z drugiego strumienia. Na wyjsci otrzymujemy tupple para jeden strumien i drugi

    this.loadLessons().pipe(
      withLatestFrom(this.course$)
    ).subscribe(
      ([lessons, course]) => console.log(lessons, course, 'tutaj')
    );

  }

  ngAfterViewInit() {
    const searchLessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        // startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(search => this.loadLessons(search))
      );

    const initialLessons$ = this.loadLessons();

    this.lessons$ = concat(initialLessons$, searchLessons$);

  }

  loadLessons(search = ''): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
      .pipe(
        map(res => res['payload'])
      );
  }


}











