import { IsString, IsNumber } from "class-validator";

export class CreateJobDTO {
    @IsString()
    name: string;

    @IsNumber()
    visaIssuingCompanyId: number;

    @IsString()
    visaName: string

    @IsNumber()
    visaQuantity: number

    @IsNumber()
    visaUnitPrice: number

}