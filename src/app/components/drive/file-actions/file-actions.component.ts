import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { DownloadProgress, DriveService, UploadProgress } from 'src/app/services/drive.service';

@Component({
  selector: 'app-file-actions',
  templateUrl: './file-actions.component.html',
  styleUrls: ['./file-actions.component.scss']
})
export class FileActionsComponent implements OnInit, AfterViewInit {

  fileActions = FILE_ACTIONS;
  fileSelected: File[] = [];
  fileUploaded: string[] = [];
  isUploading: boolean = false;
  isDownloading: boolean = false;
  getFileSize;
  addFolderInput: FormControl = new FormControl(null, [Validators.required]);
  renameInput: FormControl = new FormControl(null, [Validators.required]);
  error: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<FileActionsComponent>,
    private driveService: DriveService,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    // console.log(this.data);
    this.getFileSize = this.driveService.getFileSize;
    this.data.fileAction === this.fileActions.rename_file ?
      this.renameInput.setValue(this.data.data.currentlySelectedFile.name) :
      this.data.fileAction === this.fileActions.rename_directory ?
        this.renameInput.setValue(this.data.data.currentlySelectedFolder.name) : null;

    this.driveService.uploadProgressObsrv
      .subscribe((val: UploadProgress) => {
        if (val) this.updateProgress(val);
      });

    this.driveService.uploadCompleteObsrv
      .subscribe((f: File) => {
        if (f) this.checkAllComplete(f);
      });

    this.driveService.downloadProgressObsrv
      .subscribe((data: DownloadProgress) => {
        // console.log(data);
        let progressBarFillEl = document.getElementById('upload-progress-bar-fill');
        let progressBarDetailEl = document.getElementById('upload-progress-bar-detail');
        progressBarFillEl.style.width = `${data.percent}%`;
        progressBarDetailEl.innerText = `${data.percent}%, ${data.kbps?`${data.kbps} KB/s, `:''} ${data.mins?`${data.mins} mins`:''} ${data.secs?`${data.secs} seconds remaining`:''}`;
      });

    this.driveService.downloadResponseObsrv
      .subscribe((response: any) => {
        let linkEl = document.createElement('a');
        let objUrl = window.URL.createObjectURL(response);
        linkEl.href = objUrl;
        linkEl.download = this.data.data.currentlySelectedFile?.name;
        setTimeout(() => {
          linkEl.click();
          this.data = null;
          this.dialogRef.close();
        }, 2000);
      });
  }

  ngAfterViewInit() {
    if (this.data.fileAction === this.fileActions.add_file) {
      let fileSelectInput = document.getElementById('file-select');
      fileSelectInput.addEventListener('change', (e) => { this.filesSelected(e) }, false);
    }

    if (this.data.fileAction === this.fileActions.download_file)
      this.downloadFile();
  }

  filesSelected(e) {
    let files: FileList = e.target.files;
    for (let i = 0; i < files.length; i++) {
      this.fileSelected.push(files[i]);
    }
    // console.log(this.fileSelected);
  }

  uploadFiles() {
    this.isUploading = true;
    let searchDir = null;
    if (this.data.data.currentDirectory.split("/")[this.data.data.currentDirectory.split("/").length - 1]
      !== this.adminService.user.userId) {
      searchDir = this.data.data.currentDirectory.split("/")[this.data.data.currentDirectory.split("/").length - 1]
    }
    for (let i = 0; i < this.fileSelected.length; i++) {
      this.driveService.uploadFile(
        this.fileSelected[i],
        this.adminService.user.userId,
        searchDir
      );
    }
  }

  updateProgress(val: UploadProgress) {
    let progressEl = document.getElementById(val.fileName);
    progressEl.textContent = val.progress.toFixed(2) + '%';
  }

  checkAllComplete(f: File) {
    this.fileUploaded.push(f.name);
    if (this.fileUploaded.length === this.fileSelected.length) {
      this.driveService.notifyUploadComplete.next(true);
      this.isUploading = false;
      this.dialogRef.close();
    }
  }

  removeSelectedFile(f: File) {
    let idx = this.fileSelected.findIndex(file => file.name === f.name);
    this.fileSelected.splice(idx, 1);
    // console.log(this.fileSelected);
  }

  downloadFile() {
    this.isDownloading = true;
    this.driveService.downloadFile({
      id: this.adminService.user.userId,
      filePath: this.data.data.currentlySelectedFile.path
    });
  }

  renameFile() {
    this.error = null;
    this.driveService.renameFile({
      id: this.adminService.user.userId,
      filePath: this.data.data.currentlySelectedFile.path,
      newName: this.renameInput.value
    }).subscribe((response: any) => {
      // console.log(response);
    }, (error) => {
      console.log(error);
    }, () => {
      this.driveService.notifyUploadComplete.next(true);
      this.dialogRef.close();
    });
  }

  deleteFile() {
    this.error = null;
    this.driveService.deleteFile({
      id: this.adminService.user.userId,
      filePath: this.data.data.currentlySelectedFile.path,
    }).subscribe((response: any) => {
      // console.log(response);
    }, (error) => {
      console.log(error);
    }, () => {
      this.driveService.notifyUploadComplete.next(true);
      this.dialogRef.close();
    });
  }

  addFolder() {
    this.error = null;
    this.driveService.addFolder({
      id: this.adminService.user.userId,
      newDirPath: `${this.data.data.currentDirectory}/${this.addFolderInput.value}`
    }).subscribe((response: any) => {
      if (response === "directory-exists") {
        this.error = "Folder already exists";
      }
    }, (error) => {
      console.log(error);
    }, () => {
      this.driveService.notifyUploadComplete.next(true);
      this.dialogRef.close();
    });
  }

  renameFolder() {
    this.error = null;
    this.driveService.renameFolder({
      id: this.adminService.user.userId,
      dirPath: this.data.data.currentlySelectedFolder.path,
      newName: this.renameInput.value
    }).subscribe((response: any) => {
      // console.log(response);
      if (response === "directory-name-exists") {
        this.error = "Folder with this name already exists";
      }
    }, (error) => {
      console.log(error);
    }, () => {
      if (!this.error) {
        this.driveService.notifyUploadComplete.next(true);
        this.dialogRef.close();
      }
    });
  }

  deleteFolder() {
    this.error = null;
    this.driveService.deleteFolder({
      id: this.adminService.user.userId,
      dirPath: this.data.data.currentlySelectedFolder.path,
    }).subscribe((response: any) => {
      // console.log(response);
    }, (error) => {
      console.log(error);
    }, () => {
      this.driveService.notifyUploadComplete.next(true);
      this.dialogRef.close();
    });
  }
}

export interface DialogData {
  fileAction: FILE_ACTIONS,
  data: any
}

export enum FILE_ACTIONS {
  "add_directory",
  "rename_directory",
  "delete_directory",
  "add_file",
  "download_file",
  "rename_file",
  "delete_file"
}