import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { DriveService, FILE_MIME_TYPES } from "../../services/drive.service";

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.scss']
})
export class DriveComponent implements OnInit {

  fileTypes = FILE_MIME_TYPES;
  isAdmin: boolean = false;
  isGrid: boolean = true;
  showFileActions: boolean = false;
  tableColumns: string[] = ['fileName', 'dateModified', 'fileSize', 'select'];
  currentPageFiles: any = [
    { type: this.fileTypes.IMAGE, extension: '.jpg', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.VIDEO, extension: '.mp4', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.AUDIO, extension: '.mp3', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.TEXT, extension: '.txt', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.PDF, extension: '.pdf', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.ZIP, extension: '.zip', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.RAR, extension: '.rar', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.RTF, extension: '.rtf', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.WORD, extension: '.docx', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.EXCEL, extension: '.xlsx', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.PPT, extension: '.pptx', name: "sample", dateModified: "July 7, 2020", size: 1.1, path: null, parentDirectory: null },
    { type: this.fileTypes.DIRECTORY, extension: null, name: "images", dateModified: "July 7, 2020", size: 10.1, path: null, parentDirectory: null },
  ];
  currentlySelectedFile: any;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private driveService: DriveService,
  ) { }

  ngOnInit(): void {

    window.addEventListener('load', () => {
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
              this.isAdmin = this.adminService.user?.admin;
            }
          }, (error) => {
            console.log(error);
          }, () => { });
    });

    this.isAdmin = this.adminService.user?.admin;
  }

  selectFile(file: any) {
    this.currentlySelectedFile = file;
    this.showFileActions = true;
  }

  /** below method work on current folder */
  addFolder() { }
  uploadFile() { }

  /** below methods work on currently selected file */
  downloadFile() { }
  renameFile() { }
  deleteFile() { }

  redirectToAdminPanel() {
    this.router.navigate(['admin']);
  }

  logout() {
    localStorage.clear();
    this.adminService.user = null;
    this.adminService.users = [];
    this.currentPageFiles = [];
    this.router.navigate(['login']);
  }
}
