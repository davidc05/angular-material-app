import { Injectable } from '@angular/core';
import { NoteApi, Note, LoopBackFilter } from '../../../sdk'

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(
    private noteApi: NoteApi
  ) { }

  createNote(text, userEmail, userName, avatar, ip){
      let data = new Note();
      data.text = text;
      data.userEmail = userEmail;
      data.userName = userName;
      data.avatar = avatar;
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

    deleteNote(id) {
        return this.noteApi.deleteById<Note>(id)
            .toPromise();
    }

    updateNote(data) {
        return this.noteApi.updateAttributes<Note>(data.id, data)
            .toPromise();
    }
}
