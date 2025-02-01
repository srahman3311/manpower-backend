import { IsString, IsOptional } from "class-validator";

export class PassportDTO {

    @IsOptional()
    @IsString()
    number: string

    @IsOptional()
    @IsString()
    date: string

    @IsOptional()
    @IsString()
    expiryDate: string

    @IsOptional()
    @IsString()
    issuingInstitute: string

}
