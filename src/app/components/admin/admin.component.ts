import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatTab } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AdminService, User } from 'src/app/services/admin.service';
import { ActionsDialogComponent, ACTION_DIALOG_TYPES } from '../actions-dialog/actions-dialog.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  tableViewColumns: string[] = ["name", "email", "admin", "joinDate", "actions"];
  tableViewDataSrc: any = [];

  dialogConfig: MatDialogConfig = new MatDialogConfig();
  refreshTable: boolean = false;
  adminId: string;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private dialog: MatDialog,
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
              this.adminId = this.adminService.user.userId;
            }
          }, (error) => {
            console.log(error);
          }, () => { });
    });

    this.getAllUsers();

    this.adminId = this.adminService.user.userId;

    this.dialogConfig.disableClose = true;
    this.dialogConfig.maxHeight = window.innerHeight / 2 + 100;
    this.dialogConfig.maxWidth = window.innerWidth / 3;

    this.adminService.refreshUsersObsrv.subscribe(isRefresh => {
      if (isRefresh)
        this.getAllUsers();
    });
  }

  private getAllUsers() {
    this.refreshTable = true;
    this.adminService.getAllUsers()
      .subscribe((response: any) => {
        console.log(response);
        if (Array.isArray(response))
          this.adminService.users = response;
        else
          this.adminService.users = [response];
      }, (error) => {
        console.log(error);
      }, () => {
        this.tableViewDataSrc = this.adminService.users;
        this.refreshTable = false;
      });
  }

  addUser() {
    this.dialogConfig.data = { dialogAction: ACTION_DIALOG_TYPES['add-user'], user: null }
    this.dialog.open(ActionsDialogComponent, this.dialogConfig);
  }

  editUser(user: User) {
    this.dialogConfig.data = { dialogAction: ACTION_DIALOG_TYPES['edit-user'], user }
    this.dialog.open(ActionsDialogComponent, this.dialogConfig);
  }

  deleteUser(user: User) {
    this.dialogConfig.data = { dialogAction: ACTION_DIALOG_TYPES.confirmation, user }
    this.dialog.open(ActionsDialogComponent, this.dialogConfig);
  }

  returnToDrive() {
    this.router.navigate(['drive']);
  }
}
