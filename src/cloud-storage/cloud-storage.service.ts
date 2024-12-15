import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = 'study-planner';
  }

  async uploadFile(file: Express.Multer.File, id: number): Promise<string> {
    const { originalname, buffer } = file;
    const fileName = `${Date.now()}-${originalname}-${id}`;

    const fileUpload = this.storage.bucket(this.bucketName).file(fileName);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => reject(err));
      stream.on('finish', () => resolve(fileUpload.publicUrl()));

      stream.end(buffer);
    });
  }
}