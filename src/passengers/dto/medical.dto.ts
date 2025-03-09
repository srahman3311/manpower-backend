import { IsString, IsOptional, IsEnum } from "class-validator";
import { MedicalStatus } from "../entities/medical.entity";

export class MedicalDTO {

    @IsOptional()
    @IsString()
    date: string

    @IsOptional()
    @IsString()
    expiryDate: string

    @IsOptional()
    @IsEnum(MedicalStatus, { message: "medical status must be of one of following - processing & completed"})
    status: MedicalStatus

}
