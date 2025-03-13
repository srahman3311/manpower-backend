import { 
    Controller, 
    Query,
    Body, 
    Get, 
    Post,
    Patch,
    Delete, 
    Param
} from "@nestjs/common";
import { AccountService } from "./accounts.service";
import { CreateAccountDTO } from "./dto/create-accoount.dto";
import { Account } from "./account.entity";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/accounts")

export class AccountController {

    constructor(private readonly accountService: AccountService) {}

    @Get("")
    getAccounts(
        @Query() queryDto: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ accounts: Account[], total: number }> {
        return this.accountService.getAccounts(queryDto, ctx)
    }

    @Get(":id") 
    getAccountById(@Param() params: { id: number }): Promise<Account | null> {
        return this.accountService.getAccountById(params.id)
    }

    @Post("create")
    createAccount(
        @Body() createAccountDto: CreateAccountDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Account> {
        return this.accountService.createAccount(ctx.tenantId, createAccountDto);
    }

    @Patch(":id/edit")
    editAccount(
        @Param() paramDto: ParamDTO, 
        @Body() createAccountDto: CreateAccountDTO
    ): Promise<Account | null> {
        return this.accountService.editAccount({
            ...paramDto,
            ...createAccountDto
        })
    }

    @Delete(":id/delete")
    deleteAccount(@Param() paramDto: ParamDTO): Promise<void> {
        return this.accountService.deleteAccount(paramDto.id)
    }

}