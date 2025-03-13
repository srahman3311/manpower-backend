import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateAccountDTO {

    @IsString()
    name: string

    @IsOptional()
    @IsString()
    bankName: string

    @IsOptional()
    @IsString()
    bankBranchName: string

    @IsOptional()
    @IsString()
    bankAccountHolderName: string

    @IsOptional()
    @IsString()
    bankAccountNumber: string

    @IsNumber()
    balance: number

}