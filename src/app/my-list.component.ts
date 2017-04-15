import {Component, OnInit, OnDestroy} from "@angular/core";
import {Subscription, Observable} from "rxjs";
import {Router} from "@angular/router";
import {MyService} from "./obj.service";
import {Todo} from "./todo";

@Component({
  selector: 'my-list',
  template:`
  <h2>{{title}}</h2>
  
  <ul>
    <li *ngFor="let todo of todos">
      <a [routerLink]="['/todo/edit',todo.id]">{{todo.text}}</a>
    </li>
  </ul>
  
  <div *ngIf="activityInfo">{{activityInfo}}</div>
  <button *ngIf="" (click)="getData()">Retry</button>
`
})

export class MyListComponent implements OnInit, OnDestroy
{
  title: string = 'List';
  activityInfo: string;
  subscriptions: Subscription[] = [];
  todos: Todo[];
  error: boolean = false;

  constructor(private router:Router, private myService:MyService)
  {
  }

  getData():void{
    let more:string;
    let page:number;
    page=1;
    for (var i = 0; i < 3; i ++)
    {
      //this.loadData(i + 1);
      this.loadData(i+1);
      more = localStorage.getItem('more');

    }
  }

  ngOnInit(): void
  {
    console.log('List - init');
    localStorage.setItem('more', 'y');
    this.getData();
    this.wsSubscribe();
  }

  loadData(page:number):void
  {
    this.error = false;

    let more:string = localStorage.getItem('more');
    //if(more == 'y')
    //{
      console.log('List - load data');
      this.activityInfo = 'Loading...';

      this.todos = JSON.parse(localStorage.getItem('todos',));

      let lastUpdate: number;
      if (this.todos == null) {
        this.todos = [];
        lastUpdate = 0;
      }
      else {
        this.getMaxUpdate(this.todos).subscribe(maxRez => lastUpdate = maxRez);
      }

      this.subscriptions.push(this.myService.getData(page, lastUpdate).subscribe(
        results => {
          console.log('List - Fetch data successful');
          this.todos = results;
          this.activityInfo = null;
        },
        error => {
          console.log('List - Fetch data failed');
          this.activityInfo = error.message;
          this.error = true;
          localStorage.setItem('more','n');
          //timer pt retry
          //Observable.timer(3000).subscribe(this.loadData.bind(this))
        }
      ));
    //}
  }

  getMaxUpdate(todos:Todo[]): Observable<number>
  {
    let x = Observable.from(todos.map(note => note.updated)).max();
    return x;
  }

  wsSubscribe(): void
  {
    this.subscriptions.push(this.myService.changes().subscribe(
      results =>
      {
        console.log('List - change next (ws)');
        this.todos = results;
      }
    ));
  }

  ngOnDestroy(): void
  {
    console.log('List - destroy');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
