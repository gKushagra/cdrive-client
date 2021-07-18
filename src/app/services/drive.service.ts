import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  driveUrl: string = environment.cdrive_api2;
  uploadProgress: Subject<UploadProgress> = new Subject();
  uploadProgressObsrv: Observable<UploadProgress> = this.uploadProgress.asObservable();
  uploadComplete: Subject<File> = new Subject();
  uploadCompleteObsrv: Observable<File> = this.uploadComplete.asObservable();
  notifyUploadComplete: Subject<boolean> = new Subject();
  notifyUploadCompleteObsrv: Observable<boolean> = this.notifyUploadComplete.asObservable();

  constructor(
    private http: HttpClient,
  ) { }

  getDirectoryTree(rootDir: string) {
    return this.http.get(this.driveUrl + `directory/${rootDir}`);
  }

  uploadFile(f: File, rootDir: string, uploadDir: string) {
    let formData = new FormData();
    let xhr = new XMLHttpRequest();
    let updateProgress = (percent: number) => {
      this.uploadProgress.next({ fileName: f.name, progress: percent });
    }
    let uploadComplete = (response: UploadResponse) => {
      console.log(response);
      this.uploadComplete.next(f);
    }

    formData.set('file', f);
    xhr.open("POST", this.driveUrl + `file/upload/${rootDir}/${uploadDir}`);
    xhr.upload.addEventListener('progress', function (e) {
      let percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0;
      updateProgress(percent);
    });
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4)
        uploadComplete(JSON.parse(xhr.response));
    }
    // xhr.setRequestHeader("Content-Type", "multipart/form-data");
    xhr.send(formData);
  }

  downloadFile(payload) {
    // TODO
  }

  renameFile(payload) {
    return this.http.post(this.driveUrl + 'file/rename', payload);
  }

  deleteFile(payload) {
    return this.http.post(this.driveUrl + 'file/delete', payload);
  }

  addFolder(payload) {
    return this.http.post(this.driveUrl + 'directory/add', payload);
  }

  renameFolder(payload) {
    return this.http.post(this.driveUrl + 'directory/rename', payload);
  }

  deleteFolder(payload) {
    return this.http.post(this.driveUrl + 'directory/delete', payload);
  }

  /** utility to get file size in KB, MB or GB */
  getFileSize(bytes: number): string {
    if (bytes > (1024 * 1024 * 1024)) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(3) + ' GB';
    }
    else if (bytes > (1024 * 1024)) {
      return (bytes / (1024 * 1024)).toFixed(3) + ' MB';
    }
    else if (bytes < (1024 * 1024)) {
      return (bytes / 1024).toFixed(3) + ' KB';
    }
  }

  /** utility to get generalized mime type. audio, video, image and text have various ext's */
  getGeneralizedType(fileType: string): FILE_MIME_TYPES {
    if (["image", "video", "audio", "text"].indexOf(fileType.split('/')[0]) >= 0) {
      for (const key in FILE_MIME_TYPES) {
        if (fileType.split('/')[0] ===
          FILE_MIME_TYPES[key].split('/')[0]) {
          return FILE_MIME_TYPES[key];
        }
      }
    } else {
      for (const key in FILE_MIME_TYPES) {
        if (fileType === FILE_MIME_TYPES[key]) {
          return FILE_MIME_TYPES[key];
        }
      }
    }
  }
}

export interface TreeNode {
  path: string,
  file: File,
  children: TreeNode[]
}

export interface DriveFile {
  lastModified: Date,
  name: string,
  size: number,
  type: string,
  path: string,
  generalizedType: FILE_MIME_TYPES
}

export interface UploadProgress {
  fileName: string,
  progress: number
}

export interface UploadResponse {
  fields: any,
  files: any
}

export enum FILE_MIME_TYPES {
  IMAGE = 'image/*',
  VIDEO = 'video/*',
  AUDIO = 'audio/*',
  TEXT = 'text/*',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  RAR = 'application/vnd.rar',
  RTF = 'application/rtf',
  WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  DIRECTORY = 'inode/directory',
}