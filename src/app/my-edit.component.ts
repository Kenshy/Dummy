import {Component, OnInit, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router, Params} from "@angular/router";
import {MyService} from "./obj.service";
import {Todo} from "./todo";
@Component({
  selector: 'my-edit',
  template: `
  <label>{{todo.id}}</label>
  <input [(ngModel)]="todo.text">
  <input [(ngModel)]="todo.status">
  <button (click)="submit()">Submit</button>
  
  <div *ngIf="activityInfo">{{activityInfo}}</div>
`
})

export class MyEditComponent implements OnInit, OnDestroy
{
  subscriptions: Subscription[] = [];
  todo: Todo;
  activityInfo: string;

  constructor(private route:ActivatedRoute, private myService: MyService, private router: Router)
  {
  }

  ngOnInit(): void
  {
    console.log('Edit - init');

    this.route.params
      .switchMap((params: Params) => this.myService.getNote(params['id']))
      .subscribe(rez =>
      {
        this.todo = rez;//daca intoarce doar o nota
      }
    );
  }

  submit(): void
  {
    this.subscriptions.push(this.myService.saveData(this.todo).subscribe(
      event => {
        console.log('EventEdit - save succeeded');
        this.activityInfo = null;
        this.router.navigate(['/todo/list']);
      },
      error => {
        this.activityInfo = error.message;
        console.log('EventEdit - save failed', error);
      }
    ));

  }

  ngOnDestroy(): void
  {
    console.log('Edit - destroy');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
