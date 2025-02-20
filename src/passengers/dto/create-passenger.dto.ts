import { IsString, IsOptional, IsNumber } from "class-validator";
import { AddressDTO } from "src/global/addresses/address.dto";
import { PassportDTO } from "./passport.dto";
import { MedicalDTO } from "./medical.dto";

export class CreatePassengerDTO {

    @IsString()
    name: string

    @IsString()
    phone: string

    @IsNumber()
    jobId: number

    @IsNumber()
    agentId: number

    @IsOptional()
    @IsString()
    email: string

    @IsOptional()
    @IsString()
    birthDate: string

    @IsOptional()
    @IsNumber()
    age: number

    @IsOptional()
    @IsString()
    fatherName: string

    @IsOptional()
    @IsString()
    motherName: string

    @IsOptional()
    @IsString()
    nationalId: string

    @IsOptional()
    @IsString()
    occupation: string

    @IsOptional()
    @IsString()
    weight: string

    @IsOptional()
    @IsString()
    height: string

    @IsOptional()
    @IsString()
    experience: string

    @IsOptional()
    passport: PassportDTO

    @IsOptional()
    medical: MedicalDTO

    @IsOptional()
    address: AddressDTO

}
