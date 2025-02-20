import { IsString, IsNumber, IsOptional, IsEnum } from "class-validator";
import { VisaType } from "../job.entity";

export class CreateJobDTO {

    @IsString()
    name: string;

    @IsNumber()
    visaCompanyId: number;

    @IsOptional()
    @IsString()
    expiryDate: string

    @IsEnum(VisaType, { message: 'visa type must be one of: processing and sale' })
    visaType: VisaType;

    @IsString()
    visaName: string

    @IsNumber()
    visaQuantity: number

    @IsNumber()
    visaUnitPrice: number

}