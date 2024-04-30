import {AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {TodoItemInterface} from "../../models/todo-item.interface";
import {CommonModule, NgForOf} from "@angular/common";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatFormFieldModule, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ErrorStateMatcher, provideNativeDateAdapter, ShowOnDirtyErrorStateMatcher} from "@angular/material/core";
import {Router, RouterLink} from "@angular/router";
import {StorageService} from "../../services/storage.service";
import {v4} from 'uuid';
import {debounceTime, interval} from "rxjs";
import {DebounceClickDirective} from "../../directives/debounce-click.directive";
import {TableItemComponent} from "../table-item/table-item.component";


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgForOf,
    NgxMaterialTimepickerModule,
    CommonModule,
    MatLabel,
    MatDatepickerInput,
    MatHint,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerModule,
    MatSuffix,
    MatInput,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DebounceClickDirective,
    TableItemComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, AfterContentChecked {
  @Input({alias: 'name', required: true})
  tableName!: string;
  @Input()
  isCreateMode: boolean = false;
  @Input()
  isFavoriteMode: boolean = false;
  @Input()
  tableItems: TodoItemInterface[] = [
    {id: v4(), title: 'untitled', isDone: false, isFavorite: false, createdAt: new Date(), expireAt: new Date()},
  ];
  favoriteTableItems: TodoItemInterface[] = [];
  form: FormGroup;
  todaysDate: Date = new Date();
  isMobile: any;

  constructor(private storage: StorageService,
              private cdr: ChangeDetectorRef,
              private router: Router) {
    this.form = new FormGroup<any>({
      title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      expirationDate: new FormControl('', [Validators.required]),
      expirationTime: new FormControl(null),
    });
  }

  ngAfterContentChecked(): void {
    this.favoriteTableItems = this.tableItems.filter((item: Partial<TodoItemInterface>) => item.isFavorite);
    this.cdr.markForCheck();
  }


  ngOnInit(): void {
    interval(1000).pipe().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  shouldHighlight(item: Partial<TodoItemInterface>): boolean {
    return this.getTimeDiff(item) <= 1000 * 60 * 60;
  }

  getTimeDiff(item: Partial<TodoItemInterface>): number {
    return new Date(item.expireAt ?? '')?.getTime() - new Date().getTime() - 4 * 1000 * 60 * 60;
  }

  getExpirationTime(item: Partial<TodoItemInterface>): string {
    return new Date(this.getTimeDiff(item)).toString();
  }

  deleteItem(item: TodoItemInterface): void {
    this.storage.deleteTodo(item).subscribe();
  }

  addTodo() {
    if (this.formValidator()) {
      this.markFormAsDirty();
      return;
    }
    const todo: TodoItemInterface = {
      id: v4(),
      title: this.form.get('title')?.value,
      isDone: false,
      isFavorite: false,
      createdAt: new Date(),
      expireAt: this.setTime(),
    };
    this.storage.todosSubject.next([...this.storage.todosSubject.value, todo])
    this.storage.addTodo(todo).subscribe({
      next: (item) => {
        this.router.navigate(['/list']);
      },
      complete: () => {
        this.form.reset();
      },
    });
  }

  setTime(): Date {
    const date: Date = new Date(this.form.get('expirationDate')?.value);
    const time: string = this.form.get('expirationTime')?.value;
    if (time) {
      const [hours, minutes] = time.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
    }
    return date;
  }

  formValidator(): boolean {
    return this.form.controls['expirationDate'].hasError('required') ||
      this.form.controls['title'].hasError('required') &&
      this.form.controls['title'].dirty;
  }

  markFormAsDirty() {
    this.form.controls['expirationDate'].markAsDirty();
    this.form.controls['title'].markAsDirty();
  }


  toggleFavorite(item: TodoItemInterface) {
    this.storage.updateTodo({...item, isFavorite: !item.isFavorite}).pipe(debounceTime(400)).subscribe(
    );
  }

  toggleDone(item: TodoItemInterface) {
    this.storage.updateTodo({...item, isDone: !item.isDone}).subscribe();
  }
}
