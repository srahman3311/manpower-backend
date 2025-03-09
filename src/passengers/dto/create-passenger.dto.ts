import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { AddressDTO } from "src/global/addresses/address.dto";
import { PassportDTO } from "./passport.dto";
import { MedicalDTO } from "./medical.dto";
import { PassengerStatus } from "../entities/passenger.entity";

export class CreatePassengerDTO {

    @IsString()
    name: string

    @IsString()
    phone: string

    @IsOptional()
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
    @IsString()
    enjazNumber: string

    @IsOptional()
    @IsString()
    visaNumber: string

    @IsOptional()
    @IsString()
    visaIssueDate: string

    @IsOptional()
    @IsString()
    visaExpiryDate: string

    @IsOptional()
    @IsString()
    idNumber: string

    @IsOptional()
    @IsNumber()
    cost: number

    @IsOptional()
    @IsNumber()
    sale: number

    @IsOptional()
    address: AddressDTO

    @IsOptional()
    @IsEnum(PassengerStatus, { message: "passenger status must be of one of following - processing & completed"})
    status: PassengerStatus
    

}
