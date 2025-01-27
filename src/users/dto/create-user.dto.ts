import { IsString, IsOptional, IsEnum } from "class-validator";
import { UserRole } from "../users.entity";

export class CreateUserDTO {

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsString()
    phone: string

    @IsString()
    email: string 

    @IsOptional() // For editing user
    @IsString()
    password: string

    @IsEnum(UserRole, { 
        message: "role must be one of the following: admin, director, managing_director" 
    })
    role: UserRole

    @IsOptional()
    @IsString()
    imageUrl: string

}