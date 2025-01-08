import { IsOptional, IsString } from "class-validator";

export class JobQueryDTO {

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

export class JobParamDTO {

    @IsOptional()
    @IsString()
    id?: string

}