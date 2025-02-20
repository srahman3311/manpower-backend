import { IsString, IsOptional, Length } from "class-validator";
import { AddressDTO } from "src/global/addresses/address.dto";

export class CreateCompanyDTO {

    @IsString()
    name: string

    @IsString()
    email: string

    @IsOptional()
    @IsString()
    @Length(1, 255)
    phone: string

    @IsOptional()
    address?: AddressDTO

}