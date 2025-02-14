import { 
    Controller, 
    Req,
    Get, 
    Post, 
    Patch, 
    Body,
    UseGuards, 
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { Request } from "express";
import { ExpenseService } from "./expenses.service";
import { CreateExpenseDTO } from "./dto/create-expense.dto";
import { Expense } from "./expense.entity";
// import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";

@Controller("api/expenses")

export class ExpenseController {

    constructor(private readonly expenseService: ExpenseService) {}

    // @UseGuards(AuthGuard)
    @Get("me")
    getAuthUser(@Req() request: Request) {
        const id = (request as any).user.sub;
        return this.expenseService.getExpenseById(id)
    }

    // @UseGuards(AuthGuard)
    @Get("")
    getExpenses(@Query() queryDto: QueryDTO): Promise<{ expenses: Expense[], total: number }> {
        return this.expenseService.getExpenses(queryDto)
    }

    // @UseGuards(AuthGuard)
    @Post("create")
    createExpense(@Body() createExpenseDto: CreateExpenseDTO): Promise<Expense> {
        return this.expenseService.createExpense(createExpenseDto);
    }

    @Patch(":id/edit")
    editExpense(
        @Param() paramDto: ParamDTO, 
        @Body() createExpenseDto: CreateExpenseDTO
    ): Promise<Expense | null> {
        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createExpenseDto;
        return this.expenseService.editExpense(
            parseInt(paramDto.id as string), 
            { 
                name,
                description,
                amount,
                jobId, 
                passengerId 
            }
        )
    }

    // @UseGuards(AuthGuard)
    @Delete(":id/delete")
    deleteExpense(@Param() paramDto: ParamDTO): Promise<void> {
        return this.expenseService.deleteExpense(paramDto.id)
    }

}