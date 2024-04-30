import {Component, Input} from '@angular/core';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TodoItemInterface} from "../../models/todo-item.interface";
import {debounceTime} from "rxjs";
import {StorageService} from "../../services/storage.service";
import {DatePipe, NgClass} from "@angular/common";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {DebounceClickDirective} from "../../directives/debounce-click.directive";

@Component({
  selector: 'app-table-item',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    DatePipe,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatHint,
    MatSuffix,
    NgxMaterialTimepickerModule,
    DebounceClickDirective,
    NgClass
  ],
  templateUrl: './table-item.component.html',
  styleUrl: './table-item.component.scss'
})
export class TableItemComponent {
  @Input()
  isCreateMode: boolean = false;
  @Input({required: true, alias: 'todo'})
  item!: TodoItemInterface;
  form: FormGroup;
  todaysDate: Date = new Date();


  constructor(private storage: StorageService) {
    this.form = new FormGroup<any>({
      title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      expirationDate: new FormControl('', [Validators.required]),
      expirationTime: new FormControl(null),
    });
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
    this.storage.updateTodo({...item, isFavorite: !item.isFavorite}).pipe(debounceTime(400)).subscribe();
  }

  isToday(itemExpireAt: Date): boolean {
    return itemExpireAt?.getDate() === this.todaysDate.getDate()
  }

  toggleDone(item: TodoItemInterface) {
    this.storage.updateTodo({...item, isDone: !item.isDone}).subscribe();
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
}
