import {AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TableComponent} from "../table/table.component";
import {TodoItemInterface} from "../../models/todo-item.interface";
import {NavigationEnd, Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {StorageService} from "../../services/storage.service";
import {take} from "rxjs";
import {AsyncPipe} from "@angular/common";

// @ts-ignore
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    TableComponent,
    AsyncPipe
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  isFavorite: boolean = false;


  constructor(private router: Router,
              private cdr: ChangeDetectorRef,
              protected storage: StorageService) {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isFavorite = event.url.includes('favorite');
      }
    });
    if (this.storage.todosSubject.value.length === 0) {
      this.getAll();
      this.isFavorite = this.router.url.includes('favorite');
    }
  }


  getAll() {
    this.storage.getAllTodos().pipe(take(1)).subscribe({
      next: (key) => {
        this.storage.todosSubject.next(key as TodoItemInterface[]);
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });
  }


}
