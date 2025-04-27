import { IsOptional, IsString } from "class-validator";

export class QueryDTO {

    @IsOptional()
    @IsString()
    searchText: string

    @IsOptional()
    @IsString()
    skip: string

    @IsOptional()
    @IsString()
    limit: string

    @IsOptional()
    @IsString()
    startDate: string

    @IsOptional()
    @IsString()
    endDate: string

    @IsOptional()
    @IsString()
    agentId: string

    @IsOptional()
    @IsString()
    jobId: string

    @IsOptional()
    @IsString()
    isMedicalDone: string

    @IsOptional()
    @IsString()
    isBMETFingerDone: string

    @IsOptional()
    @IsString()
    isVisaApplicationFingerDone: string

    @IsOptional()
    @IsString()
    isVisaIssued: string

    @IsOptional()
    @IsString()
    isFlightDone: string


}

export class ParamDTO {

    @IsOptional()
    @IsString()
    id?: string

    @IsOptional()
    @IsString()
    jobId: string

}