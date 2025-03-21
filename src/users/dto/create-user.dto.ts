import { 
    IsString, 
    IsNumber,
    IsOptional, 
    IsEnum, 
    IsEmail,
    ArrayNotEmpty,
    IsArray, 
} from "class-validator";
import { UserRole, UserPermission } from "../entities/user.entity";
import { AddressDTO } from "src/global/addresses/address.dto";

export class CreateUserDTO {

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsString()
    phone: string

    @IsString()
    @IsEmail()
    email: string 

    // IsOptional is for editing user
    @IsOptional()
    @IsString()
    password: string

    @IsOptional()
    @IsNumber()
    balance: number

    @IsArray()
    @IsEnum(UserRole, { each: true })
    @ArrayNotEmpty()
    roles: UserRole[]

    @IsArray()
    @IsEnum(UserPermission, { each: true })
    @ArrayNotEmpty()
    permissions: UserPermission[]

    @IsString()
    @IsOptional()
    imageUrl?: string

    @IsOptional()
    address?: AddressDTO

}