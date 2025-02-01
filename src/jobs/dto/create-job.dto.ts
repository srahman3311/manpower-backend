import { IsString, IsNumber } from "class-validator";

export class CreateJobDTO {
    @IsString()
    name: string;

    @IsNumber()
    visaCompanyId: number;

    @IsString()
    visaName: string

    @IsNumber()
    visaQuantity: number

    @IsNumber()
    visaUnitPrice: number

}