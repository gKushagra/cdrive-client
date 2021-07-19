import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { DriveFile, DriveService, FILE_MIME_TYPES, TreeNode } from "../../services/drive.service";
import { ActionsDialogComponent, ACTION_DIALOG_TYPES } from '../actions-dialog/actions-dialog.component';
import { FileActionsComponent, FILE_ACTIONS } from './file-actions/file-actions.component';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.scss']
})
export class DriveComponent implements OnInit {

  fileTypes = FILE_MIME_TYPES;
  fileActions = FILE_ACTIONS;
  isAdmin: boolean = false;
  isGrid: boolean = true;
  showFileActions: boolean = false;
  tableColumns: string[] = ['fileName', 'dateModified', 'fileSize', 'select'];
  currentlySelectedFile: DriveFile;
  currentlySelectedFolder: DriveFile;
  directoryTree: TreeNode;
  currentDirectoryFiles: DriveFile[] = [];
  getFileSize;
  getGeneralizedType;
  navigationDirs: TreeNode[] = [];

  constructor(
    private router: Router,
    private adminService: AdminService,
    private driveService: DriveService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getFileSize = this.driveService.getFileSize;
    this.getGeneralizedType = this.driveService.getGeneralizedType;

    window.addEventListener('load', () => {
      if (!this.adminService.user) {
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
              this.getDirectoryTree();
            }
          }, (error) => {
            console.log(error);
          }, () => { });
      }
    });

    this.isAdmin = this.adminService.user?.admin;
    this.adminService.user ? this.getDirectoryTree() : null;

    this.driveService.notifyUploadCompleteObsrv
      .subscribe(isComplete => {
        if (isComplete) {
          this.showFileActions = false;
          this.currentlySelectedFile = null;
          this.currentlySelectedFolder = null;
          this.currentDirectoryFiles = [];
          this.driveService.getDirectoryTree(this.adminService.user.userId)
            .subscribe((response: TreeNode) => {
              // console.log(response);
              this.directoryTree = response;
            }, (error) => {
              console.log(error);
            }, () => {
              this.reloadNavigation();
            });
        }
      });
  }

  getDirectoryTree() {
    this.driveService.getDirectoryTree(this.adminService.user.userId)
      .subscribe((response: TreeNode) => {
        // console.log(response);
        this.directoryTree = response;
      }, (error) => {
        console.log(error);
      }, () => {
        this.navigationDirs.push(this.directoryTree);
        this.loadCurrentDirectory();
      });
  }

  loadCurrentDirectory() {
    this.currentDirectoryFiles = this.navigationDirs[this.navigationDirs.length - 1].children.length > 0 ?
      this.navigationDirs[this.navigationDirs.length - 1].children.map((f: TreeNode) => {
        return {
          lastModified: f.file ?
            new Date(f.file?.lastModified) : null,
          name: f.file ? f.file.name : f.path.split("/")[f.path.split("/").length - 1],
          size: f.file ? (f.file.type ? f.file.size : null) : null,
          type: f.file?.type,
          path: f.path,
          generalizedType: f.file ? (f.file.type ?
            this.getGeneralizedType(f.file.type) :
            this.fileTypes.DIRECTORY) : null,
        }
      }) : [];
    // console.log(this.currentDirectoryFiles);
  }

  // reload 
  reloadNavigation() {
    let newNav: TreeNode[] = [];
    for (let i = 0; i < this.navigationDirs.length; i++) {
      // console.log('currently on', this.navigationDirs[i]);
      this.traverseTree(this.directoryTree, this.navigationDirs[i].path, newNav);
    }
    // console.log(newNav);
    this.navigationDirs = [];
    this.navigationDirs = newNav;
    this.loadCurrentDirectory();
  }

  /**
   * Method finds TreeNode with
   * path === dirPath and appends to newNav
   * @param node TreeNode
   * @param dirPath path to search
   * @param newNav TreeNode[] navigationArr
   * @returns null;
   */
  traverseTree(node: TreeNode, dirPath: string, newNav: TreeNode[]) {
    let searchDirName = dirPath.split("/")[dirPath.split("/").length - 1];
    let rootName = node.path.split("/")[node.path.split("/").length - 1];
    if (rootName === searchDirName) {
      // console.log('found', node);
      newNav.findIndex(d => d.path.split('/')[d.path.split("/").length - 1] === rootName) < 0 ?
        newNav.push(node) : null;
    }

    for (let i = 0; i < node.children.length; i++) {
      // console.log(i);
      let childName = node.children[i].path.split("/")[node.children[i].path.split("/").length - 1];
      if (childName === searchDirName) {
        // console.log('found', node.children[i]);
        newNav.findIndex(d => d.path.split('/')[d.path.split("/").length - 1] === childName) < 0 ?
          newNav.push(node.children[i]) : null;
      }

      if (node.children[i].children.length > 0) {
        // console.log('has child', i, node.children[i].children);
        this.traverseTree(node.children[i], dirPath, newNav);
      }
    }
  }

  selectFile(file: DriveFile) {
    this.currentlySelectedFile = file;
    this.showFileActions = true;
  }

  selectFolder(file: DriveFile) {
    let idx = this.navigationDirs[this.navigationDirs.length - 1].children
      .findIndex(dir => dir.file.name === file.name);
    // console.log(idx);
    this.navigationDirs.push(this.navigationDirs[this.navigationDirs.length - 1].children[idx]);
    // console.log(this.navigationDirs);
    this.loadCurrentDirectory();
  }

  navigateDir(dir: TreeNode) {
    if (this.navigationDirs.length === 1) return;
    if (dir.file?.name ===
      this.navigationDirs[this.navigationDirs.length - 1].file?.name)
      return;
    if (this.navigationDirs.length === 2) {
      this.navigationDirs.pop();
      this.loadCurrentDirectory();
    }
    if (this.navigationDirs.length > 2) {
      if (dir.file?.name === this.navigationDirs[this.navigationDirs.length - 2].file?.name) {
        this.navigationDirs.pop();
        this.loadCurrentDirectory();
      }
    }
  }

  openFileActionsDialog(fileAction: FILE_ACTIONS) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.minHeight = window.innerHeight / 3;
    dialogConfig.minWidth = window.innerWidth / 3;
    dialogConfig.data = {
      fileAction: fileAction,
      data: {
        currentDirectory: this.navigationDirs[this.navigationDirs.length - 1].path,
        currentlySelectedFile: this.currentlySelectedFile ?
          this.currentlySelectedFile : null,
        currentlySelectedFolder: this.currentlySelectedFolder ?
          this.currentlySelectedFolder : null,
      }
    };
    this.dialog.open(FileActionsComponent, dialogConfig);
  }

  openSettings() {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxHeight = window.innerHeight / 2 + 100;
    dialogConfig.maxWidth = window.innerWidth / 3;
    dialogConfig.data = {
      dialogAction: ACTION_DIALOG_TYPES['edit-user'],
      user: this.adminService.user
    }
    this.dialog.open(ActionsDialogComponent, dialogConfig);
  }

  redirectToAdminPanel() {
    this.router.navigate(['admin']);
  }

  logout() {
    localStorage.clear();
    this.adminService.user = null;
    this.adminService.users = [];
    this.currentDirectoryFiles = [];
    this.currentlySelectedFile = null;
    this.currentlySelectedFolder = null;
    this.router.navigate(['login']);
  }
}
