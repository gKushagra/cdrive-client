import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  adminUrl = environment.cdrive_api;

  user: User;
  users: User[] = [];

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
}

export interface User {
  userId: string,
  name: string,
  email: string,
  joinDate: Date,
  admin: boolean
}
