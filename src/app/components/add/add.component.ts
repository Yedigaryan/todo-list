import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TableComponent} from "../table/table.component";

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddComponent {

}
