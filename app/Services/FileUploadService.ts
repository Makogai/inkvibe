// File: app/Services/FileUploadService.ts

import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import Application from '@ioc:Adonis/Core/Application';
import Env from '@ioc:Adonis/Core/Env';

export default class FileUploadService {

  public static async uploadFile(file: MultipartFileContract, subDirectory: string): Promise<string | null> {
    if (!file.isValid) {
      throw new Error('Uploaded file is not valid');
    }

    const fileName = new Date().getTime().toString() + `.${file.extname}`;
    await file.move(Application.publicPath(`uploads/${subDirectory}`), {
      name: fileName
    });

    const baseUrl = Env.get('APP_URL');
    const filePath = `${baseUrl}/uploads/${subDirectory}/${fileName}`;
    return filePath;
  }

}
