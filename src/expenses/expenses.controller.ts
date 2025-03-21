import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Body,
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { ExpenseService } from "./expenses.service";
import { CreateExpenseDTO } from "./dto/create-expense.dto";
import { Expense } from "./expense.entity";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RolesAuth } from "src/global/decorators/RolesAuth.decorator";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/expenses")

export class ExpenseController {

    constructor(private readonly expenseService: ExpenseService) {}

    @Get("")
    getExpenses(
        @Query() queryDto: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ expenses: Expense[], total: number }> {
        return this.expenseService.getExpenses(queryDto, ctx)
    }

    @Post("create")
    createExpense(
        @Body() createExpenseDto: CreateExpenseDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Expense> {
        return this.expenseService.createExpense(ctx, createExpenseDto);
    }

    @Patch(":id/edit")
    editExpense(
        @Param() paramDto: ParamDTO, 
        @Body() createExpenseDto: CreateExpenseDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Expense | null> {
        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            debitedFromAccountId
        } = createExpenseDto;
        return this.expenseService.editExpense(
            parseInt(paramDto.id as string), 
            { 
                name,
                description,
                amount,
                jobId, 
                passengerId,
                debitedFromAccountId
            },
            ctx
        )
    }
    
    @Patch(":id/toggle")
    @RolesAuth(["admin", "director", "tenant", "manager"])
    toggleApprovalStatus(
        @Param() paramDto: ParamDTO, 
        @RequestContext() ctx: JwtPayload
    ): Promise<Expense | null> {
        return this.expenseService.toggleApprovalStatus(
            parseInt(paramDto.id as string), 
            ctx
        )
    }

    @Delete(":id/delete")
    deleteExpense(@Param() paramDto: ParamDTO): Promise<void> {
        return this.expenseService.deleteExpense(paramDto.id)
    }

}