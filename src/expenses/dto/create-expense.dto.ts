import { 
    IsString, 
    IsNumber,
    IsOptional, 
    IsEnum
} from "class-validator";
import { ExpenseApprovalStatus } from "../expense.entity";

export class CreateExpenseDTO {

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
    @IsEnum(ExpenseApprovalStatus, { message: 'approval status must be one of following values: approved and rejected' })
    approvalStatus?: ExpenseApprovalStatus


}