import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-actions-dialog',
  templateUrl: './actions-dialog.component.html',
  styleUrls: ['./actions-dialog.component.scss']
})
export class ActionsDialogComponent implements OnInit {

  dialogActions = ACTION_DIALOG_TYPES;
  currentAction;
  userForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
    admin: new FormControl(false)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ActionsDialogComponent>,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.currentAction = this.data?.dialogAction;
    if (this.currentAction === this.dialogActions['edit-user']) {
      this.userForm.controls.name.setValue(this.data.user.name);
      this.userForm.controls.email.setValue(this.data.user.email);
      this.userForm.controls.admin.setValue(this.data.user.admin);
    }
  }

  userAddEdit() {
    if (this.currentAction === this.dialogActions['add-user']) {
      this.adminService.addUser(this.userForm.value)
        .subscribe((response: string) => {
          // console.log(response);
        }, (error) => {
          console.log(error);
        }, () => {
          this.adminService.refreshUsers.next(true);
          this.dialogRef.close();
        });
    }

    if (this.currentAction === this.dialogActions['edit-user']) {
      this.adminService.updateUser({
        userId: this.data.user.userId,
        name: this.userForm.controls.name.value,
        email: this.userForm.controls.email.value,
        admin: this.userForm.controls.admin.value
      }).subscribe((response: any) => {
        // console.log(response);
      }, (error) => {
        console.log(error);
      }, () => {
        this.adminService.refreshUsers.next(true);
        this.dialogRef.close();
      });
    }
  }

  deleteUser() {
    this.adminService.deleteUser(this.data.user.userId)
      .subscribe((response: any) => {
        // console.log(response);
      }, (error) => {
        console.log(error);
      }, () => {
        this.adminService.refreshUsers.next(true);
        this.dialogRef.close();
      });
  }
}

export enum ACTION_DIALOG_TYPES {
  "add-user",
  "edit-user",
  "confirmation",
}
