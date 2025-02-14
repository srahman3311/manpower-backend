import { IsOptional, IsString } from "class-validator";

export class AddressDTO {

    @IsOptional()
    @IsString()
    line1: string

    @IsOptional()
    @IsString()
    line2: string

    @IsOptional()
    @IsString()
    postalCode: string 

    @IsOptional()
    @IsString()
    city: string

    @IsOptional()
    @IsString()
    state: string
    
    @IsOptional()
    @IsString()
    country: string

}
