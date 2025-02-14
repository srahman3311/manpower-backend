import { IsString, IsOptional, IsPhoneNumber, Length, IsNumber } from "class-validator";
import { AddressDTO } from "src/global/addresses/address.dto";

export class CreateCompanyDTO {

    @IsNumber()
    tenantId: number

    @IsString()
    name: string

    @IsString()
    email: string

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    @Length(1, 255)
    phone: string

    @IsOptional()
    address?: AddressDTO

}