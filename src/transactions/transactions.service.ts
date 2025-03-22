import { 
    Injectable, 
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository} from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { Transaction } from "./transaction.entity";
import { JwtPayload } from "src/global/types/JwtPayload";
import { AccountService } from "src/accounts/accounts.service";
import { UserService } from "src/users/users.service";
import { Account } from "src/accounts/account.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()

export class TransactionService {

    constructor(
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
        private readonly userService: UserService,
        private readonly accountService: AccountService
    ) {}

    async getTransactionById(id: number): Promise<Transaction | null> {
        return await this.transactionRepository.findOne({ 
            where: { id },
            relations: [
                "tenant", 
                "debitedFromAccount", 
                "debitedFromUser", 
                "creditedToAccount", 
                "creditedToUser", 
                "user"
            ]  
        });
    }

    async getTransactions(query: QueryDTO, ctx: JwtPayload): Promise<{ transactions: Transaction[], total: number }> {

        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [transactions, total] = await this.transactionRepository
                            .createQueryBuilder("transaction")
                            .where(
                                `(
                                    transaction.name LIKE :searchText OR 
                                    transaction.description LIKE :searchText
                                ) AND transaction.deleted = false AND transaction.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("transaction.tenant", "tenant")
                            .leftJoinAndSelect("transaction.debitedFromAccount", "debitedFromAccount")
                            .leftJoinAndSelect("transaction.debitedFromUser", "debitedFromUser")
                            .leftJoinAndSelect("transaction.creditedToAccount", "creditedToAccount")
                            .leftJoinAndSelect("transaction.creditedToUser", "creditedToUser")
                            .leftJoinAndSelect("transaction.user", "user")
                            .orderBy("transaction.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { transactions, total };

    }


    async createTransaction(ctx: JwtPayload, createTransactionDto: CreateTransactionDTO): Promise<Transaction> {

        // sub is the logged in user id
        const { sub, tenantId } = ctx;

        const { 
            name,
            description,
            amount,
            debitedFromUserId,
            debitedFromAccountId,
            creditedToAccountId,
            creditedToUserId 
        } = createTransactionDto;

        await this.debitAndCreditUserAndAccountBalance(createTransactionDto)

        const transaction = this.transactionRepository.create({
            tenant: { id: tenantId } as Tenant,
            debitedFromAccount: debitedFromAccountId ? { id: debitedFromAccountId } as Account : undefined,
            debitedFromUser: debitedFromUserId ? { id: debitedFromUserId } as User : undefined,
            creditedToAccount: creditedToAccountId ? { id: creditedToAccountId } as Account : undefined,
            creditedToUser: creditedToUserId ? { id: creditedToUserId } as User : undefined,
            user: { id: sub } as User,
            name,
            description,
            amount
        })

        return this.transactionRepository.save(transaction);

    }

    async editTransaction(
        id: number, 
        createTransactionDto: Omit<CreateTransactionDTO, "tenantId">
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

        const transaction = await this.getTransactionById(id);
        if(!transaction) throw new NotFoundException("Transaction Not Found");

        await this.adjustAccountAndUserBalance(transaction);
        await this.debitAndCreditUserAndAccountBalance(createTransactionDto);

        transaction.name = name;
        transaction.amount = amount;

        if(description) {
            transaction.description = description;
        }

        if(debitedFromUserId) {
            transaction.debitedFromUser = { id: debitedFromUserId } as User;
            transaction.debitedFromAccount = null;
        }

        if(debitedFromAccountId) {
            transaction.debitedFromAccount = { id: debitedFromAccountId } as Account;
            transaction.debitedFromUser = null;
        }

        if(creditedToUserId) {
            transaction.creditedToUser = { id: creditedToUserId } as User;
            transaction.creditedToAccount = null;
        }

     
        if(creditedToAccountId) {
            transaction.creditedToAccount = { id: creditedToAccountId } as Account;
            transaction.creditedToUser = null;
        }

        await this.transactionRepository.save(transaction);
        return await this.getTransactionById(id);

    }

    async deleteTransaction(id?: string): Promise<void> {

        const parsedId = parseInt(id as string);

        const transaction = await this.getTransactionById(parsedId);
        if(!transaction) throw new NotFoundException("Transaction doesn't exist");

        await this.adjustAccountAndUserBalance(transaction);

        await this.transactionRepository.update(
            { id: parsedId }, 
            { deleted: true }
        );

    }

    // When a transaction is edited or deleted
    private async adjustAccountAndUserBalance(transaction: Transaction) {

        const {
            debitedFromAccountId,
            debitedFromUserId,
            creditedToAccountId,
            creditedToUserId,
            amount
        } = transaction;

        if(debitedFromAccountId) {
            await this.accountService.updateAccountBalance(debitedFromAccountId, amount)
        }

        if(debitedFromUserId){
            await this.userService.updateUserBalance(debitedFromUserId, amount)
        }

        if(creditedToAccountId) {
            await this.accountService.updateAccountBalance(creditedToAccountId, -amount)
        } 
        
        if(creditedToUserId){
            await this.userService.updateUserBalance(creditedToUserId, -amount)
        }

    }

    private async debitAndCreditUserAndAccountBalance(params: CreateTransactionDTO) {

        const { 
            amount,
            debitedFromUserId,
            debitedFromAccountId,
            creditedToAccountId,
            creditedToUserId,
        } = params;

        if(debitedFromAccountId) {
            await this.accountService.updateAccountBalance(debitedFromAccountId, -amount)
        } 
        
        if(debitedFromUserId){
            await this.userService.updateUserBalance(debitedFromUserId, -amount)
        }

        if(creditedToAccountId) {
            await this.accountService.updateAccountBalance(creditedToAccountId, amount)
        } 
        
        if(creditedToUserId){
            await this.userService.updateUserBalance(creditedToUserId, amount)
        }

    }

}