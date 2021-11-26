import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { map, retryWhen } from 'rxjs/operators';
import { Rx } from '../decorators/observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'QuestionTwo';

  @Rx.AutoSubscribe({ propertyName: 'categories' })
  categories$ = this.http
    .get<string[]>('https://api.publicapis.org/categories')
    .pipe(
      map((res) => res.map((r) => ({ name: r }))),
      retryWhen(() => timer(3000))
    );

  categories!: string[];

  constructor(private http: HttpClient) {}
}
