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
import { CreateRevenueDTO } from "./dto/create-revenue.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { Revenue } from "./revenue.entity";
import { JwtPayload } from "src/global/types/JwtPayload";
import { AccountService } from "src/accounts/accounts.service";
import { UserService } from "src/users/users.service";
import { Account } from "src/accounts/account.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()

export class RevenueService {

    constructor(
        @InjectRepository(Revenue) private readonly revenueRepository: Repository<Revenue>,
        private readonly userService: UserService,
        private readonly accountService: AccountService,
        private dataSource: DataSource
    ) {}

    async getRevenueById(id: number): Promise<Revenue | null> {
        return await this.revenueRepository.findOne({ 
            where: { id },
            relations: ["tenant", "job", "passenger", "creditedToAccount", "user"]  
        });
    }

    async getRevenues(query: QueryDTO, ctx: JwtPayload): Promise<{ revenues: Revenue[], total: number }> {

        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [revenues, total] = await this.revenueRepository
                            .createQueryBuilder("revenue")
                            .where(
                                `(
                                    revenue.name LIKE :searchText OR 
                                    revenue.description LIKE :searchText
                                ) AND revenue.deleted = false AND revenue.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("revenue.tenant", "tenant")
                            .leftJoinAndSelect("revenue.job", "job")
                            .leftJoinAndSelect("revenue.creditedToAccount", "creditedToAccount")
                            .leftJoinAndSelect("revenue.user", "user")
                            .leftJoinAndSelect("revenue.passenger", "passenger")
                            .orderBy("revenue.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { revenues, total };

    }

    getRevenuesByJobId(jobId: number): Promise<Revenue[]> {
        const revenues = this.revenueRepository.find(
            { 
                where: { jobId },
                relations: ["job", "passenger", "creditedToAccount", "user"] 
            },
            
        );
        return revenues;
    }

    getRevenuesByPassengerId(passengerId: number): Promise<Revenue[]> {
        const revenues = this.revenueRepository.find(
            { 
                where: { passengerId },
                relations: ["job", "passenger", "creditedToAccount", "user"] 
            },
            
        );
        return revenues;
    }

    async createRevenue(ctx: JwtPayload, createRevenueDto: CreateRevenueDTO): Promise<Revenue> {

        const { tenantId, sub } = ctx;

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            creditedToAccountId 
        } = createRevenueDto;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if(creditedToAccountId) {
                await this.accountService.updateAccountBalanceWithTransaction(
                    creditedToAccountId, 
                    queryRunner,
                    amount
                )
            } else {
                await this.userService.updateUserBalanceWithTransaction(
                    sub, 
                    queryRunner,
                    amount
                )
            }
    
            const revenue = queryRunner.manager.create(Revenue, {
                tenant: { id: tenantId } as Tenant,
                job: jobId ? { id: jobId } as Job : undefined,
                passenger: passengerId ? { id: passengerId } as Passenger : undefined,
                creditedToAccount: creditedToAccountId ? { id: creditedToAccountId } as Account : undefined,
                user: { id: sub } as User,
                name,
                description,
                amount
            });

            const savedRevenue = await queryRunner.manager.save(revenue);
            await queryRunner.commitTransaction();
            return savedRevenue;

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    async editRevenue(
        id: number, 
        createRevenueDto: Omit<CreateRevenueDTO, "tenantId">,
        ctx: JwtPayload
    ): Promise<Revenue | null> {

        const { sub } = ctx;

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            creditedToAccountId 
        } = createRevenueDto;

        const revenue = await this.getRevenueById(id);
        if(!revenue) throw new NotFoundException("Revenue Not Found");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            // Amount more than existing revenue amount will be charged from user balance or account selected
            let adjustableAmount = amount - revenue.amount;

            // User might be using the existing account or changing it or adding just now
            if(creditedToAccountId) {

                // User is changing the account. Old account must be refunded and the new one charged.
                if (
                    revenue.creditedToAccountId && 
                    revenue.creditedToAccountId !== creditedToAccountId
                ) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        revenue.creditedToAccountId, 
                        queryRunner,
                        -revenue.amount
                    );
                    await this.accountService.updateAccountBalanceWithTransaction(
                        creditedToAccountId, 
                        queryRunner,
                        amount
                    );

                // User is keeping the existing account, just adjust the amount
                } else if(revenue.creditedToAccountId) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        revenue.creditedToAccountId, 
                        queryRunner,
                        adjustableAmount
                    );

                // User is adding account now. Credit the account and deduct the revenue from user's account.    
                } else {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        creditedToAccountId, 
                        queryRunner,
                        amount
                    );

                    if(revenue.userId) {
                        await this.userService.updateUserBalanceWithTransaction(
                            revenue.userId, 
                            queryRunner,
                            -revenue.amount
                        );
                    } 

                }

            // User is unselecting account or revenue was added to user's account or there was no user involved
            } else {

                // User is unselecting account and choosing to use user's balance instead
                if(revenue.creditedToAccountId) {

                    await this.accountService.updateAccountBalanceWithTransaction(
                        revenue.creditedToAccountId, 
                        queryRunner,
                        -revenue.amount
                    );

                    if(revenue.userId) {
                        await this.userService.updateUserBalanceWithTransaction(
                            revenue.userId, 
                            queryRunner,
                            revenue.amount
                        )
                    } else {
                        await this.userService.updateUserBalanceWithTransaction(
                            sub,
                            queryRunner, 
                            amount
                        )
                    }

                // Just adjust the user's balance
                } else if(revenue.userId) {
                    await this.userService.updateUserBalanceWithTransaction(
                        revenue.userId, 
                        queryRunner,
                        adjustableAmount
                    )
                } 
                // There was no user when revenue was created, so, credit the logged in user's account
                else {
                    await this.userService.updateUserBalanceWithTransaction(
                        sub, 
                        queryRunner,
                        amount
                    )
                }

            }

            revenue.name = name;
            revenue.amount = amount;
    
            if(description) {
                revenue.description = description;
            }
    
            if(!revenue.user) {
                revenue.user = { id: sub } as User;
            }
    
            if(creditedToAccountId) {
                revenue.creditedToAccount = { id: creditedToAccountId } as Account;
            }
    
            if(revenue.creditedToAccountId && !creditedToAccountId) {
                revenue.creditedToAccount = null;
            }
            
            if(jobId) {
                revenue.job = { id: jobId } as Job;
            }
    
            if(passengerId) {
                revenue.passenger = { id: passengerId } as Passenger;
            }
    
            if(revenue.job && !jobId) {
                revenue.job = null
            }
    
            if(revenue.passenger && !passengerId) {
                revenue.passenger = null
            }
    
            await queryRunner.manager.save(revenue);

            await queryRunner.commitTransaction();

            return await this.getRevenueById(id);

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }


    }

    async deleteRevenue(id?: string): Promise<void> {

        const parsedId = parseInt(id as string);

        const revenue = await this.getRevenueById(parsedId);
        if(!revenue) throw new NotFoundException("Expense Not Found");

        const { 
            creditedToAccountId, 
            userId, 
            amount 
        } = revenue;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if(creditedToAccountId) {
                await this.accountService.updateAccountBalanceWithTransaction(
                    creditedToAccountId,
                    queryRunner, 
                    -amount
                )
            } else if(userId) {
                await this.userService.updateUserBalanceWithTransaction(
                    userId, 
                    queryRunner,
                    -amount
                )
            }
    
            await queryRunner.manager.update(
                Revenue,
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