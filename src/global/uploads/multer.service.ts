import { Injectable } from "@nestjs/common";
import { MulterOptionsFactory, MulterModuleOptions } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: "../../../public",
                filename: (req, file, callback) => {
                    const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;
                    callback(null, uniqueFilename)
                }
            }),
            fileFilter: (req, file, callback) => {
                if(file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
                    return callback(new Error("Only image files are allowed"), false)
                }
                callback(null, true)
            },
            limits: {
                fileSize: 5 * 1024 * 1024
            }
        }
    }
}