import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';

import fs from 'fs';
import hasha from 'hasha';
import path, { join } from 'path';
import { slugify } from 'transliteration';

export interface IFile {
  readonly fieldname: string;
  readonly originalname: string;
  readonly encoding?: string;
  readonly mimetype: string;
  readonly buffer: Buffer;
  readonly size: number;
}

const upload_dir = __dirname + '/../../uploads';

@Injectable()
export class UploadService {
  public async upload(file: IFile) {
    if (!fs.existsSync(upload_dir)) {
      fs.mkdirSync(upload_dir);
    }

    const hash_sum = hasha(file.buffer, { algorithm: 'sha256' });

    // if (fs.existsSync(join(upload_dir, hash_sum))) {
    //   this.deleteDir(hash_sum);
    // }

    const file_dir = path.resolve(upload_dir, hash_sum);
    const file_name = slugify(file.originalname.toLowerCase());
    const full_path = path.resolve(upload_dir, hash_sum, file_name);

    if (!fs.existsSync(file_dir)) {
      fs.mkdirSync(file_dir);
    }

    await this.saveFile(full_path, file.buffer);

    await this.unzip(file.buffer, hash_sum);

    return hash_sum;
  }

  private async saveFile(file_path: string, file: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.mkdir(path.dirname(file_path), { recursive: true }, (error_mkdir: Error) => {
        if (error_mkdir) {
          reject(error_mkdir);
        }

        fs.writeFile(file_path, file, (error_write: Error) => {
          if (error_write) {
            reject(error_write);
          }

          resolve();
        });
      });
    });
  }

  private deleteDir(hash_sum: string) {
    this.deleteDirOrFile(join(upload_dir, hash_sum));
  }

  private deleteDirOrFile(file_path: string): void {
    const stats = fs.statSync(file_path);

    if (stats.isFile()) {
      fs.unlinkSync(file_path);
    } else if (stats.isDirectory()) {
      fs.readdirSync(file_path).forEach((child) => {
        this.deleteDirOrFile(`${file_path}/${child}`);
      });

      fs.rmdirSync(file_path);
    }
  }

  private async unzip(file: Buffer, hash_sum: string) {
    const zip = new AdmZip(file);
    const zip_entries = zip.getEntries();

    for (const zip_entry of zip_entries) {
      if (!zip_entry.isDirectory) {
        await this.saveFile(join(upload_dir, hash_sum, zip_entry.entryName), zip_entry.getData());
      }
    }
  }
}
