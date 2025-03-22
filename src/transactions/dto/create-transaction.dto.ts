import { 
    IsString, 
    IsNumber,
    IsOptional
} from "class-validator";

export class CreateTransactionDTO {

    @IsString()
    name: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsNumber()
    debitedFromAccountId: number

    @IsOptional()
    @IsNumber()
    debitedFromUserId: number

    @IsOptional()
    @IsNumber()
    creditedToAccountId: number
    
    @IsOptional()
    @IsNumber()
    creditedToUserId: number

    @IsNumber()
    amount: number

}