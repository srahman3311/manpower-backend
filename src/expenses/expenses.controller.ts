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
import { RolesAuth } from "src/global/decorators/RolesAuth.decorator";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

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
    getExpenses(
        @Query() queryDto: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ expenses: Expense[], total: number }> {
        return this.expenseService.getExpenses(queryDto, ctx)
    }

    // @UseGuards(AuthGuard)
    @Post("create")
    createExpense(
        @Body() createExpenseDto: CreateExpenseDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Expense> {
        return this.expenseService.createExpense(ctx.tenantId, createExpenseDto);
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
        console.log(paramDto)
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

    // @UseGuards(AuthGuard)
    @Delete(":id/delete")
    deleteExpense(@Param() paramDto: ParamDTO): Promise<void> {
        return this.expenseService.deleteExpense(paramDto.id)
    }

}