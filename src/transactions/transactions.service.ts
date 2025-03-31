import { 
    BadRequestException,
    Injectable, 
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryRunner, Repository, DataSource } from "typeorm";
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
        private readonly accountService: AccountService,
        private dataSource: DataSource
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

    private async validateTransactionDto(createTransactionDto: CreateTransactionDTO) {

        const { 
            debitedFromUserId,
            debitedFromAccountId,
            creditedToAccountId,
            creditedToUserId 
        } = createTransactionDto;

        if (
            (!debitedFromAccountId && !debitedFromUserId) ||
            (!creditedToAccountId && !creditedToUserId) ||
            ((debitedFromAccountId && creditedToAccountId) && (debitedFromAccountId === creditedToAccountId)) ||
            ((debitedFromUserId && creditedToUserId) && (debitedFromUserId === creditedToUserId)) ||
            (debitedFromAccountId && debitedFromUserId) ||
            (creditedToAccountId && creditedToUserId)
        ) {
            throw new BadRequestException("Bad Request")
        }

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

        await this.validateTransactionDto(createTransactionDto);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            await this.debitAndCreditUserAndAccountBalance(
                queryRunner, 
                createTransactionDto
            )
    
            const transaction = queryRunner.manager.create(Transaction, {
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
    
            const savedTransaction = await queryRunner.manager.save(transaction);

            await queryRunner.commitTransaction();

            return savedTransaction;
            

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

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

        await this.validateTransactionDto(createTransactionDto);

        const transaction = await this.getTransactionById(id);
        if(!transaction) throw new NotFoundException("Transaction Not Found");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            await this.adjustAccountAndUserBalance(queryRunner, transaction);
            await this.debitAndCreditUserAndAccountBalance(queryRunner, createTransactionDto);

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
    
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();

            return await this.getTransactionById(id);

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    async deleteTransaction(id?: string): Promise<void> {

        const parsedId = parseInt(id as string);

        const transaction = await this.getTransactionById(parsedId);
        if(!transaction) throw new NotFoundException("Transaction doesn't exist");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

                
            await this.adjustAccountAndUserBalance(queryRunner, transaction);

            await queryRunner.manager.update(
                Transaction,
                { id: parsedId }, 
                { deleted: true }
            );

            await queryRunner.commitTransaction();

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    // When a transaction is edited or deleted
    private async adjustAccountAndUserBalance(queryRunner: QueryRunner, transaction: Transaction) {

        const {
            debitedFromAccountId,
            debitedFromUserId,
            creditedToAccountId,
            creditedToUserId,
            amount
        } = transaction;

        if(debitedFromAccountId) {
            await this.accountService.updateAccountBalanceWithTransaction(
                debitedFromAccountId, 
                queryRunner,
                amount
            )
        }

        if(debitedFromUserId){
            await this.userService.updateUserBalanceWithTransaction(
                debitedFromUserId, 
                queryRunner,
                amount
            )
        }

        if(creditedToAccountId) {
            await this.accountService.updateAccountBalanceWithTransaction(
                creditedToAccountId,
                queryRunner, 
                -amount
            )
        } 
        
        if(creditedToUserId){
            await this.userService.updateUserBalanceWithTransaction(
                creditedToUserId, 
                queryRunner,
                -amount
            )
        }

    }

    private async debitAndCreditUserAndAccountBalance(queryRunner: QueryRunner, params: CreateTransactionDTO) {

        const { 
            amount,
            debitedFromUserId,
            debitedFromAccountId,
            creditedToAccountId,
            creditedToUserId,
        } = params;

        if(debitedFromAccountId) {
            await this.accountService.updateAccountBalanceWithTransaction(
                debitedFromAccountId, 
                queryRunner,
                -amount
            )
        } 
        
        if(debitedFromUserId){
            await this.userService.updateUserBalanceWithTransaction(
                debitedFromUserId,
                queryRunner, 
                -amount
            )
        }

        if(creditedToAccountId) {
            await this.accountService.updateAccountBalanceWithTransaction(
                creditedToAccountId, 
                queryRunner,
                amount
            )
        } 
        
        if(creditedToUserId){
            await this.userService.updateUserBalanceWithTransaction(
                creditedToUserId, 
                queryRunner,
                amount
            )
        }

    }

}