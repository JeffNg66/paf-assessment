import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private userdata: string = undefined;

  setData(data:any){
      this.userdata = data;
  }

  getData():any{
      return this.userdata;
  }
}

