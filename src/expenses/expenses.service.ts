import { 
    BadRequestException,
    Injectable, 
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { Job } from "src/jobs/job.entity";
import { Passenger } from "src/passengers/entities/passenger.entity";
import { CreateExpenseDTO } from "./dto/create-expense.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { Expense } from "./expense.entity";
import { JwtPayload } from "src/global/types/JwtPayload";
import { AccountService } from "src/accounts/accounts.service";
import { UserService } from "src/users/users.service";
import { Account } from "src/accounts/account.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()

export class ExpenseService {

    constructor(
        @InjectRepository(Expense) private readonly expenseRepository: Repository<Expense>,
        private readonly userService: UserService,
        private readonly accountService: AccountService,
        private dataSource: DataSource
    ) {}

    async getExpenseById(id: number): Promise<Expense | null> {
        return await this.expenseRepository.findOne({ 
            where: { id },
            relations: ["tenant", "job", "passenger", "debitedFromAccount", "user"]  
        });
    }

    async getExpenses(query: QueryDTO, ctx: JwtPayload): Promise<{ expenses: Expense[], total: number }> {

        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [expenses, total] = await this.expenseRepository
                            .createQueryBuilder("expense")
                            .where(
                                `(
                                    expense.name LIKE :searchText OR 
                                    expense.description LIKE :searchText
                                ) AND expense.deleted = false AND expense.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("expense.tenant", "tenant")
                            .leftJoinAndSelect("expense.job", "job")
                            .leftJoinAndSelect("expense.passenger", "passenger")
                            .leftJoinAndSelect("expense.debitedFromAccount", "debitedFromAccount")
                            .leftJoinAndSelect("expense.user", "user")
                            .orderBy("expense.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { expenses, total };

    }

    async createExpense(ctx: JwtPayload, createExpenseDto: CreateExpenseDTO): Promise<Expense> {

        // sub is the logged in user id
        const { sub, tenantId } = ctx;

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            debitedFromAccountId 
        } = createExpenseDto;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if(debitedFromAccountId) {
                await this.accountService.updateAccountBalanceWithTransaction(
                    debitedFromAccountId, 
                    queryRunner,
                    -amount
                )
            } else {
                await this.userService.updateUserBalanceWithTransaction(
                    sub,
                    queryRunner, 
                    -amount
                )
            }

            const expense = queryRunner.manager.create(Expense, {
                tenant: { id: tenantId } as Tenant,
                job: jobId ? { id: jobId } as Job : undefined,
                passenger: passengerId ? { id: passengerId } as Passenger : undefined,
                debitedFromAccount: debitedFromAccountId ? { id: debitedFromAccountId } as Account : undefined,
                user: { id: sub } as User,
                name,
                description,
                amount
            });
            const savedExpense = await queryRunner.manager.save(expense);
            await queryRunner.commitTransaction();
            return savedExpense;

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    async editExpense(
        id: number, 
        createExpenseDto: Omit<CreateExpenseDTO, "tenantId">,
        ctx: JwtPayload
    ): Promise<Expense | null> {

        const { sub } = ctx;

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            debitedFromAccountId
        } = createExpenseDto;

        const expense = await this.getExpenseById(id);
        if(!expense) throw new NotFoundException("Expense Not Found");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
               
            // Amount more than existing expense amount will be charged from user balance or account selected
            let adjustableAmount = expense.amount - amount;

            // User might be using the existing account or changing it or adding just now
            if(debitedFromAccountId) {

                // User is changing the account. Old account must be refunded and the new one charged.
                if (
                    expense.debitedFromAccountId && 
                    expense.debitedFromAccountId !== debitedFromAccountId
                ) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        expense.debitedFromAccountId, 
                        queryRunner,
                        expense.amount
                    );
                    await this.accountService.updateAccountBalanceWithTransaction(
                        debitedFromAccountId, 
                        queryRunner,
                        -amount
                    );

                // User is keeping the existing account, just adjust the amount
                } else if(expense.debitedFromAccountId) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        expense.debitedFromAccountId, 
                        queryRunner,
                        adjustableAmount
                    );

                // User is adding account now. Charge the account and deduct the expense from user's account.    
                } else {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        debitedFromAccountId, 
                        queryRunner,
                        -amount
                    );

                    if(expense.userId) {
                        await this.userService.updateUserBalanceWithTransaction(
                            expense.userId, 
                            queryRunner,
                            expense.amount
                        );
                    } 

                }

            // User is unselecting account or expense was charged from user's account or there was no user involved
            } else {

                // User is unselecting account and choosing to use user's balance instead
                if(expense.debitedFromAccountId) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        expense.debitedFromAccountId, 
                        queryRunner,
                        expense.amount
                    );

                    if(expense.userId) {
                        await this.userService.updateUserBalanceWithTransaction(
                            expense.userId, 
                            queryRunner,
                            -expense.amount
                        )
                    } else {
                        await this.userService.updateUserBalanceWithTransaction(
                            sub, 
                            queryRunner,
                            -amount
                        )
                    }

                // Just adjust the user's balance
                } else if(expense.userId) {
                    await this.userService.updateUserBalanceWithTransaction(
                        expense.userId, 
                        queryRunner,
                        adjustableAmount
                    )
                } 
                // There was no user when expense was created, so, charge the logged in user's account
                else {
                    await this.userService.updateUserBalanceWithTransaction(
                        sub, 
                        queryRunner,
                        -amount
                    )
                }

            }

            expense.name = name;
            expense.amount = amount;

            if(description) {
                expense.description = description;
            }

            if(!expense.user) {
                expense.user = { id: sub } as User;
            }

            if(debitedFromAccountId) {
                expense.debitedFromAccount = { id: debitedFromAccountId } as Account;
            }

            if(expense.debitedFromAccountId && !debitedFromAccountId) {
                expense.debitedFromAccount = null;
            }

            if(jobId) {
                expense.job = { id: jobId } as Job;
            }

            if(passengerId) {
                expense.passenger = { id: passengerId } as Passenger;
            }

            if(expense.job && !jobId) {
                expense.job = null
            }

            if(expense.passenger && !passengerId) {
                expense.passenger = null
            }

            await queryRunner.manager.save(expense);

            await queryRunner.commitTransaction();

            return await this.getExpenseById(id);

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }


    }

    async toggleApprovalStatus(expenseId: number, ctx: JwtPayload) {

        const expense = await this.getExpenseById(expenseId);

        if(!expense) throw new NotFoundException("Expense Not Found");

        const role = ctx.roles[0] ? ctx.roles[0].name : "admin";
        let statusKey = role + "ApprovalStatus";
        
        let status = (expense as any)[statusKey];
        if(status === "approved") {
            status = "rejected"
        } else {
            status = "approved"
        }

        (expense as any)[statusKey] = status;

        await this.expenseRepository.save(expense);

        return await this.getExpenseById(expenseId);

        
    }

    async deleteExpense(id?: string): Promise<void> {

        const parsedId = parseInt(id as string);

        const expense = await this.getExpenseById(parsedId);
        if(!expense) throw new NotFoundException("Expense Not Found");

        const { 
            debitedFromAccountId, 
            userId, 
            amount 
        } = expense;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if(debitedFromAccountId) {
                await this.accountService.updateAccountBalanceWithTransaction(
                    debitedFromAccountId, 
                    queryRunner,
                    amount
                )
            } else if(userId) {
                await this.userService.updateUserBalanceWithTransaction(
                    userId,
                    queryRunner, 
                    amount
                )
            }
    
            await queryRunner.manager.update(
                Expense,
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

}