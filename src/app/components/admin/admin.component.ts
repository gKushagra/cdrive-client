import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  tableViewColumns: string[] = ["name", "email", "joinDate", "actions"];
  tableViewDataSrc = [];

  constructor(
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {

    window.addEventListener('load', () => {
      console.log('here');
      if (!this.adminService.user)
        this.adminService.refreshToken()
          .subscribe((response: any) => {
            // console.log(response);
            if (response === 'unauthorized') {
              localStorage.removeItem('token');
              this.router.navigate(['login']);
            } else {
              localStorage.setItem('token', response.token);
              this.adminService.user = response.user;
              this.getAllUsers();
            }
          }, (error) => {
            console.log(error);
          }, () => { });
    });

    this.getAllUsers();
  }

  private getAllUsers() {
    this.adminService.getAllUsers()
      .subscribe((response: any) => {
        console.log(response);
        this.adminService.users = response;
      }, (error) => {
        console.log(error);
      }, () => {
        this.tableViewDataSrc = this.adminService.users;
      });
  }
}
