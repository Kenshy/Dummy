import {Http, Headers, Response} from "@angular/http";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {Todo} from "./todo";


@Injectable()
export class MyService
{
  private serverUrl: string = 'localhost:3000';
  private httpUrl: string = `http://${this.serverUrl}`;
  private wsUrl: string = `ws://${this.serverUrl}`;
  private webSocket: WebSocket;
  private todos:Todo[];
  private page:number;
  private headers = new Headers({'Content-Type': 'application/json'});

  private more: boolean = false;
  constructor(private http:Http)
  {
    this.webSocket = new WebSocket(this.wsUrl);
    this.webSocket.onopen = openEvent => console.log('webSocket onOpen', openEvent);
    this.webSocket.onclose = closeEvent => console.log('webSocket onClose', closeEvent);
  }

  saveData(todo: Todo): Observable<Todo>
  {
    return this.http.put(`${this.httpUrl}/todo/`+todo.id, JSON.stringify(todo), {headers: this.headers})//need to include headers.
      .map(res => {
        console.log('save success');
        return res.json() as Todo;
      })
      .catch((r: Response) =>
        Observable.throw(new Error(r.json().text)));
  }

  getData(page:number, lastUpdated:number):Observable<Todo[]> {
    this.todos = JSON.parse(localStorage.getItem('todos',));
    if (this.todos == null) {
      this.todos = [];
    }
    console.log('link:' + `${this.httpUrl}/todo?lastUpdated=` + lastUpdated + '&page=' + page);
    return this.http
      .get(`${this.httpUrl}/todo?lastUpdated=` + lastUpdated + '&page=' + page)
      .map((r: Response) => {
          let newTodo: Todo[];
          newTodo = r.json().items as Todo[];
          this.more = r.json().more as boolean;
          this.page = r.json().page as number;
          if(this.more == true)
            localStorage.setItem('more', 'y');
          else
            localStorage.setItem('more', 'n');
          this.todos = this.mergeD(newTodo, this.todos);
        localStorage.setItem('todos', JSON.stringify(this.todos));
        return this.todos;
        }
      )
      .catch((r: Response) =>
        Observable.throw(new Error('Service unavailable')));
  }

  mergeD(newOnes: Todo[], oldOnes: Todo[]): Todo[]
  {
    let toAdd: Todo[] = [];
    for (var i = 0; i < newOnes.length; i ++)
    {
      if(oldOnes.find(old => old.id == newOnes[i].id))
      {
        oldOnes.find(old => old.id == newOnes[i].id).text = newOnes[i].text;
        oldOnes.find(old => old.id == newOnes[i].id).updated = newOnes[i].updated;
        oldOnes.find(old => old.id == newOnes[i].id).status = newOnes[i].status;
      }
      else
      {toAdd.push(newOnes[i])}
    }
    return oldOnes.concat(toAdd);

  }

  search(term: string): Observable<Todo[]> {
    let toReturn: Todo[] = [];
    for(var i = 0; i < this.todos.length; i ++) {
      if(this.todos[i].text.includes(term) && this.todos[i].status == 'active')
      {
        toReturn.push(this.todos[i]);
      }
    }

    console.log('search found: ' + toReturn.length);

    return Observable.create(observer => observer.next(toReturn));
  }


  changes(): Observable<Todo[]>
  {
    return Observable.create(observer =>
    {
      console.log('ws set onMessage');
      this.webSocket.onmessage = messageEvent =>
      {
        console.log('socket msg received:' + messageEvent.data);
        const todoReceived = JSON.parse(messageEvent.data) as Todo;

        console.log('socket onMessage', todoReceived);
        console.log('msj primit prin socket' +  todoReceived.text);
        //do something with objReceived, ex:
        this.todos = JSON.parse(localStorage.getItem('todos',));
        this.todos.find(todo => todo.id == todoReceived.id).text = todoReceived.text;
        this.todos.find(todo => todo.id == todoReceived.id).updated = todoReceived.updated;

        localStorage.setItem('todos', JSON.stringify(this.todos));
        observer.next([...this.todos]);
        //this.cachedEvents.push(objReceived); <- add an element to existing ones
        //this.notes.find(note => note.id == nota.id).text = nota.text; <- update an element.
        //observer.next([...listaMeaDeElemente]);
      };

      this.webSocket.onerror = error => console.log('WS error', error);
    })
  }

  getNote(id:number): Observable<Todo>
  {
    return Observable.create(observable => observable.next(this.todos.find(todo => todo.id == id)));
  }
}
