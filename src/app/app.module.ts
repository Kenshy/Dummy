import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {Routes, RouterModule} from "@angular/router";
import {MyService} from "./obj.service";
import {MyListComponent} from "./my-list.component";
import {MyEditComponent} from "./my-edit.component";
import {TodoSearchComponent} from "./todo-search.component";

const routes: Routes = [
  {path: '', redirectTo: 'todo/list', pathMatch: 'full'},
  {path: 'todo/list', component: MyListComponent},
  {path: 'todo/edit/:id', component: MyEditComponent},
];
@NgModule({
  declarations: [
    AppComponent,
    MyListComponent,
    MyEditComponent,
    TodoSearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [MyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
