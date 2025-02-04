import { IsString, IsOptional } from "class-validator";

export class CreateCompanyDTO {

    @IsString()
    name: string

    @IsString()
    email: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsString()
    address?: string

}