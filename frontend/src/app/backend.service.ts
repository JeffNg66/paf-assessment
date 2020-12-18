import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from './models';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  apiUrl = "http://localhost:3000"

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  userLogin(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/login/', user, this.httpOptions).pipe(
      tap(() => console.log(`check user`)),
      catchError(this.handleError<User>('userLogin'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
