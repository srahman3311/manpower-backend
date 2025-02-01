import { IsString, IsOptional } from "class-validator";

export class MedicalDTO {

    @IsOptional()
    @IsString()
    date: string

    @IsOptional()
    @IsString()
    expiryDate: string

    @IsOptional()
    @IsString()
    status: string

}
