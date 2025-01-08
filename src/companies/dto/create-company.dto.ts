import { IsString } from "class-validator";

export class CreateCompanyDTO {

    @IsString()
    name: string

    @IsString()
    email: string

    @IsString()
    phone?: string

    @IsString()
    address?: string

}