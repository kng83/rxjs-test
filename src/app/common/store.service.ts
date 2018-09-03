import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {Course} from '../model/course';
import {createHttpObservable} from './util';
import {delayWhen, filter, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';


@Injectable({
  providedIn: 'root'
})
export class Store {

  // dajemy Behavior aby byly dane zachowane
  private subject = new BehaviorSubject<Course[]>([]);

  courses$: Observable<Course[]> = this.subject.asObservable();

  // pobieramy wartosci inicjalizujace funkcje to wywolujemy
  // w komponencie app
  init() {

    const http$ = createHttpObservable('/api/courses');

    http$
      .pipe(
        tap(() => console.log('HTTP request executed')),
        map(res => Object.values(res['payload'])),
      )
      .subscribe(
        courses => this.subject.next(courses)
      );

  }

  selectBeginnerCourses() {
    return this.filterByCategory('BEGINNER');
  }

  selectAdvancedCourses() {
    return this.filterByCategory('ADVANCED');
  }

  // poniewaz bedziemy w courseComp uzywac first musimy sie upewnic ze nie bedzie on undefined
  // bo first bierze tylko 1 observable a tu ona ma wartosc undefinded bo BeheviorSubject inicjujemy
  // pusta tablica
  // Musi byc tutaj == a nie === to robi blad
  // prawdopodobnie jest tu konflikt string number i musimy dac pojedyncza rownosc
  selectCourseById(courseId: number) {
    return this.courses$
      .pipe(
        map(courses => courses.find(course => course.id == courseId)),
        filter(course => !!course)
      );
  }

  filterByCategory(category: string) {
    return this.courses$
      .pipe(
        map(courses => courses
          .filter(course => course.category === category))
      );
  }

  saveCourse(courseId: number, changes): Observable<any> {
    const courses = this.subject.getValue(); // bierzemy course
    const courseIndex = courses.findIndex(course => course.id === courseId);

    // robimy kopie obiekty aby nie mutowac danych
    const newCourses = courses.slice(0);
    // teraz podmieniamy ten ktory zmienilismy nowym
    // zostawiamy w obiekcie id a reszte nadpisujemy zmianami
    newCourses[courseIndex] = {
      ...courses[courseIndex],
      ...changes
    };

    this.subject.next(newCourses);

    return fromPromise(fetch(`api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'content-type': 'application/json'
      }
    }));

  }


}
