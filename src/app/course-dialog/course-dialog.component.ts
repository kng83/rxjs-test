import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Course} from '../model/course';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {fromEvent, pipe} from 'rxjs';
import {concatMap, distinctUntilChanged, exhaustMap, filter, mergeMap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import {saveCourse} from '../../../server/save-course.route';

@Component({
  selector: 'course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  course: Course;

  @ViewChild('saveButton') saveButton: ElementRef;

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course) {

    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required]
    });

  }

  ngOnInit() {
    // Mozemy byc tutaj odrazu polaczeni z forma przez property form
    // concat map uzywamy gdy 1 observable sie skonczy to robimy nastepna
    // zamiast concat mozemy dac map to zrobi nam rownolegle ale efekt
    // bedzie podobny. concatMap jest szeregowy i czekamy jak np request
    // sie dokonczy natomiast mergeMap jest rownolegly i nie czeka az dane
    // zdarzenie sie dokonczy
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        concatMap(changes => this.saveCourse(changes))
      )
      .subscribe();
  }

  // zapisanie nastepuje pozniej jak pierwsza operacja zapisana zostanie zakonczona
  saveCourse(changes) {
    return fromPromise(fetch(`/api/courses/${this.course.id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'content-type': 'application/json'
      }
    }));
  }

  ngAfterViewInit() {
    // jak damy na button save concat i klikniemy wiele razy to
    // bedziemy mieli odpowiedzi typowo po 2 sekundach i pozniej po 2 sek nastepna
    // exhaustMap pozwala nam pominac nowe observable jesli jakies stare nie zostaly jeszcze
    // wykonane. Swietne do przycisku dla ludzi ktorzy wiele razy klikaja w jeden i zapychaja
    // siec
    fromEvent(this.saveButton.nativeElement, 'click')
      .pipe(
        exhaustMap(() => this.saveCourse(this.form.value))
      ).subscribe();

  }



  close() {
    this.dialogRef.close();
  }

}
