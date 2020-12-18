import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, Upload } from './models';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  apiUrl = "http://localhost:3000"

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  httpOptions2 = {
    headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
  };

  constructor(private http: HttpClient) { }

  userLogin(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/login/', user, this.httpOptions).pipe(
      tap(() => console.log(`check user`)),
      catchError(this.handleError<User>('userLogin'))
    );
  }

  // upload(data: Upload): Observable<any> {
  //   console.log('I am here')
  //   return this.http.post<any>(this.apiUrl + '/upload/', data, this.httpOptions2).pipe(
  //     tap(() => console.log(`Upload`)),
  //     catchError(this.handleError<any>('upload'))
  //   );
  // }
  upload (uploadData : any) {
    console.log('>>upload',uploadData);
    const data = new FormData();
    data.set('imageData',uploadData.imageData)
    data.set('comments',uploadData.comments)
    data.set('title',uploadData.title)
    data.set('user_id',uploadData.username)
    data.set('password',uploadData.password)
    return this.http.post('/upload', data)
      .toPromise()
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
