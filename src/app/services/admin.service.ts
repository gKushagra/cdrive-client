import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  adminUrl = environment.cdrive_api;

  user: User;
  users: User[] = [];

  refreshUsers: Subject<boolean> = new Subject();
  refreshUsersObsrv: Observable<boolean> = this.refreshUsers.asObservable();

  constructor(
    private http: HttpClient,
  ) { }

  login(payload) {
    return this.http.post(this.adminUrl + 'login', payload);
  }

  refreshToken() {
    return this.http.get(this.adminUrl + 'refresh-token');
  }

  reset(payload) {
    return this.http.post(this.adminUrl + 'reset-auth', payload);
  }

  getAllUsers() {
    return this.http.get(this.adminUrl + 'user');
  }

  addUser(payload) {
    return this.http.post(this.adminUrl + 'user', payload);
  }

  updateUser(payload) {
    return this.http.put(this.adminUrl + 'user', payload);
  }

  deleteUser(id) {
    return this.http.delete(this.adminUrl + `user/${id}`);
  }
}

export interface User {
  userId: string,
  name: string,
  email: string,
  joinDate: Date,
  admin: boolean
}
