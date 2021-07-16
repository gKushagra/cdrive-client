import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from "../../services/admin.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  visibility: boolean = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.minLength(8)])
  });

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) { }

  ngOnInit(): void { }

  login() {
    console.log(this.loginForm.value);

    this.adminService.login(this.loginForm.value)
      .subscribe((response: any) => {
        console.log(response);
        this.adminService.user = response.user;
        localStorage.setItem('token', response.token);
      }, (error) => {
        console.log(error);
        alert(error);
      }, () => {
        this.router.navigate(['drive']);
      });
  }
}
