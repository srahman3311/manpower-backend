import { 
    IsString, 
    IsNumber,
    IsOptional, 
    IsBoolean
} from "class-validator";

export class CreateRevenueDTO {

    @IsNumber()
    tenantId: number

    @IsOptional()
    @IsNumber()
    jobId?: number

    @IsOptional()
    @IsNumber()
    passengerId?: number

    @IsString()
    name: string

    @IsOptional()
    @IsString()
    description?: string

    @IsNumber()
    amount: number

    @IsOptional()
    @IsBoolean()
    approvedByTenant?: boolean

    @IsOptional()
    @IsBoolean()
    approvedByAdmin?: boolean

    @IsOptional()
    @IsBoolean()
    approvedByDirector?: boolean

    @IsOptional()
    @IsBoolean()
    approvedByManagingDirector?: boolean

}