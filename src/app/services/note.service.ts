import { Injectable } from '@angular/core';
import { NoteApi, Note, LoopBackFilter } from '../../../sdk'

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(
    private noteApi: NoteApi
  ) { }

  createNote(text, userEmail, ip){
      let data = new Note();
      data.text = text;
      data.userEmail = userEmail;
      data.ip = ip;

      return this.noteApi.create<Note>(data)
        .toPromise();
  }

  getUserNotesByIp(ip){
    let filter: LoopBackFilter = {
      "where": {
        "ip": ip
      }
    }
    return this.noteApi.find<Note>(filter);
  }
}
