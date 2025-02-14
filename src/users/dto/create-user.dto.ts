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

    @IsNumber()
    tenantId: number

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

    @IsArray()
    @IsEnum(UserRole, { each: true })
    @ArrayNotEmpty()
    roles: UserRole[]

    @IsArray()
    @IsEnum(UserPermission, { each: true })
    @ArrayNotEmpty()
    permissions: UserPermission[]

    // @IsEnum(UserRole, { 
    //     message: "role must be one of the following: admin, director, managing_director" 
    // })
    // role: UserRole

    
    @IsString()
    @IsOptional()
    imageUrl?: string

    @IsOptional()
    address?: AddressDTO

}