import { Injectable, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorageService {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = 'study-planner';
    }

    async uploadImage(file: Express.Multer.File, id: number): Promise<string> {
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
            stream.on('finish', async () => {
                try {
                    await fileUpload.acl.update({
                        entity: 'allUsers',
                        role: 'READER'
                    });
                    resolve(fileUpload.publicUrl());
                } catch (error) {
                    reject(error);
                }
            });

            stream.end(buffer);
        });
    }

    async deleteImage(url: string): Promise<void> {
        if (url) {
            const urlComponents = url.split('/');
            const fileName = urlComponents[urlComponents.length - 1];
            try {
                const file = this.storage.bucket(this.bucketName).file(fileName);
                const [exists] = await file.exists();

                if (exists) {
                    await file.delete();
                }
            } catch (error: any) {
                throw new InternalServerErrorException(`Unable to delete file: ${fileName}`);
            }
        }
    }
}
