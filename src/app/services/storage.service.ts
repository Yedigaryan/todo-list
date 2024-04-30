import {Injectable} from '@angular/core';
import {StorageMap} from "@ngx-pwa/local-storage";
import {TodoItemInterface} from "../models/todo-item.interface";
import {BehaviorSubject, debounceTime, map, mergeMap, Observable, of, shareReplay, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public todosSubject = new BehaviorSubject<TodoItemInterface[]>([]);
  todos$: Observable<TodoItemInterface[]> = this.todosSubject.asObservable();

  getTodaysTodos(): Observable<TodoItemInterface[]> {
    return this.todos$.pipe(
      map((todos) =>
        todos.filter((todo) => new Date(todo.expireAt).getDate() === new Date().getDate())
      ),
      shareReplay(1) // Cache the result of filtering todaysTodos
    );
  }

  getOtherTodos(): Observable<TodoItemInterface[]> {
    return this.todos$.pipe(
      map((todos) =>
        todos.filter((todo) => new Date(todo.expireAt).getDate() !== new Date().getDate())
      ),
      shareReplay(1) // Cache the result of filtering otherTodos
    );
  }

  constructor(private storage: StorageMap) {
  }

  addTodo(todo: TodoItemInterface): Observable<any> {
    return this.storage.set("todo", this.todosSubject.value.concat(todo)).pipe(debounceTime(400));
  }

  getAllTodos(): Observable<unknown> {
    return this.storage.keys().pipe(
      mergeMap(keys => this.storage.get(keys)))
  }

  updateTodo(todo: TodoItemInterface): Observable<any> {
      const filteredTodos = this.todosSubject.value.filter(t => t.id !== todo.id);
      this.todosSubject.next(filteredTodos.concat(todo));
      return this.storage.set("todo", filteredTodos.concat(todo)).pipe(debounceTime(400));
  }


  deleteTodo(todo: TodoItemInterface): Observable<any> {
    const filteredTodos = this.todosSubject.value.filter(t => t.id !== todo.id);
    this.todosSubject.next(filteredTodos);
    return this.storage.set("todo", filteredTodos).pipe(debounceTime(400));
  }
}
