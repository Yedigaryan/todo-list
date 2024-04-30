import {Routes} from '@angular/router';
import {AddComponent} from "./components/add/add.component";
import {ListComponent} from "./components/list/list.component";

export const routes: Routes = [
  {path: 'add', component: AddComponent},
  {path: 'list', component: ListComponent},
  {path: 'favorites', component: ListComponent},
  {path: '**', redirectTo: '/list'}
];


