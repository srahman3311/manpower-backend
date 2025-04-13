import { IsOptional, IsString } from "class-validator";

export class QueryDTO {

    @IsOptional()
    @IsString()
    searchText?: string

    @IsOptional()
    @IsString()
    skip?: string

    @IsOptional()
    @IsString()
    limit?: string

}

export class ParamDTO {

    @IsOptional()
    @IsString()
    id?: string

    @IsOptional()
    @IsString()
    jobId: string

}