import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor() { }
}


export enum FILE_MIME_TYPES {
  IMAGE = 'image/*',
  VIDEO = 'video/*',
  AUDIO = 'audio/*',
  TEXT = 'text/plain',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  RAR = 'application/vnd.rar',
  RTF = 'application/rtf',
  WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  DIRECTORY = 'inode/directory',
}