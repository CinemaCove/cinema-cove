import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const isGif = file.mimetype === 'image/gif';
      cloudinary.uploader
        .upload_stream(
          { folder: 'cinemacove/daily-content', resource_type: 'image', ...(isGif && { format: 'gif' }) },
          (error, result) => {
            if (error || !result) {
              reject(new InternalServerErrorException('Image upload failed'));
              return;
            }
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }
}
