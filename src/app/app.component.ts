import {Component, OnInit, OnDestroy} from '@angular/core';
import {Todo} from "./todo";
import {Subject, Observable} from "rxjs";
import {MyService} from "./obj.service";

@Component({
  selector: 'app-root',
  template:`
  <h1>{{title}}</h1>
  <router-outlet></router-outlet>
  <search-todo></search-todo>
  
`
  //<search-todo></search-todo>
})
export class AppComponent implements OnInit, OnDestroy
{
  title:string = 'My App!';

  constructor(private myService: MyService)
  {}

  ngOnInit(): void {

    console.log('appComponent - init');


  }
  ngOnDestroy(): void
  {
    console.log('appCompoennt - destroy');
  }


}
