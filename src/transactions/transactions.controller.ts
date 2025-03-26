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
import { TransactionService } from "./transactions.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { Transaction } from "./transaction.entity";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RolesAuth } from "src/global/decorators/RolesAuth.decorator";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/transactions")

export class TransactionController {

    constructor(private readonly transactionService: TransactionService) {}

    @Get("")
    @RolesAuth(["admin", "tenant"])
    getTransactions(
        @Query() queryDto: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ transactions: Transaction[], total: number }> {
        return this.transactionService.getTransactions(queryDto, ctx)
    }

    @Post("create")
    @RolesAuth(["admin", "tenant"])
    createTransaction(
        @Body() createTransactionDto: CreateTransactionDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Transaction> {
        return this.transactionService.createTransaction(ctx, createTransactionDto);
    }

    @Patch(":id/edit")
    @RolesAuth(["admin", "tenant"])
    editTransaction(
        @Param() paramDto: ParamDTO, 
        @Body() createTransactionDto: CreateTransactionDTO
    ): Promise<Transaction | null> {
        const { 
            name,
            description,
            amount,
            debitedFromAccountId,
            debitedFromUserId,
            creditedToAccountId,
            creditedToUserId
        } = createTransactionDto;
        return this.transactionService.editTransaction(
            parseInt(paramDto.id as string), 
            { 
                name,
                description,
                amount,
                debitedFromAccountId,
                debitedFromUserId,
                creditedToAccountId,
                creditedToUserId
            }
        )
    }

    @Delete(":id/delete")
    @RolesAuth(["admin", "tenant"])
    deleteTransaction(@Param() paramDto: ParamDTO): Promise<void> {
        return this.transactionService.deleteTransaction(paramDto.id)
    }

}