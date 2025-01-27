import { IsString } from "class-validator"

export class AuthPayloadDTO {

    @IsString()
    email: string

    @IsString()
    password: string
    
}