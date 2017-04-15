import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {Todo} from "./todo";
import {MyService} from "./obj.service";
@Component({
  selector: 'search-todo',
  template:`
  <div>
  <input #searchBox id="search-box" (keyup)="search(searchBox.value)">
</div>

<div *ngFor="let todo of todos | async">
  {{todo.text}}
</div>
`
})

export class TodoSearchComponent implements OnInit, OnDestroy
{

  title:string = 'My App!';
  todos: Observable<Todo[]>;
  private searchTerms = new Subject<string>();

  constructor(private myService: MyService)
  {

  }

  ngOnInit(): void {
    console.log('search init');
    this.todos = this.searchTerms
      .debounceTime(500)
      .distinctUntilChanged()
      .switchMap(term => term

        ? this.myService.search(term)
        // or the observable of empty heroes if there was no search term
        : Observable.of<Todo[]>([]))
      .catch(error => {

        console.log(error);
        return Observable.of<Todo[]>([]);
      });
  }

  ngOnDestroy(): void {
    console.log('search destroy');
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

}
