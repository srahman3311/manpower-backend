import { 
    Injectable, 
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository} from "typeorm";
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
        private readonly accountService: AccountService
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

        if(creditedToAccountId) {
            await this.accountService.updateAccountBalance(creditedToAccountId, amount)
        } else {
            await this.userService.updateUserBalance(sub, amount)
        }

        const revenue = this.revenueRepository.create({
            tenant: { id: tenantId } as Tenant,
            job: jobId ? { id: jobId } as Job : undefined,
            passenger: passengerId ? { id: passengerId } as Passenger : undefined,
            creditedToAccount: creditedToAccountId ? { id: creditedToAccountId } as Account : undefined,
            user: { id: sub } as User,
            name,
            description,
            amount
        })

        return this.revenueRepository.save(revenue);

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

        
        // Amount more than existing revenue amount will be charged from user balance or account selected
        let adjustableAmount = amount - revenue.amount;

        // User might be using the existing account or changing it or adding just now
        if(creditedToAccountId) {

        // User is changing the account. Old account must be refunded and the new one charged.
        if (
            revenue.creditedToAccountId && 
            revenue.creditedToAccountId !== creditedToAccountId
        ) {

            await this.accountService.updateAccountBalance(revenue.creditedToAccountId, -revenue.amount);
            await this.accountService.updateAccountBalance(creditedToAccountId, amount);

        // User is keeping the existing account, just adjust the amount
        } else if(revenue.creditedToAccountId) {
            await this.accountService.updateAccountBalance(revenue.creditedToAccountId, adjustableAmount);

        // User is adding account now. Credit the account and deduct the revenue from user's account.    
        } else {

            await this.accountService.updateAccountBalance(creditedToAccountId, amount);

            if(revenue.userId) {
                await this.userService.updateUserBalance(revenue.userId, -revenue.amount);
            } 

        }

        // User is unselecting account or revenue was added to user's account or there was no user involved
        } else {

            // User is unselecting account and choosing to use user's balance instead
            if(revenue.creditedToAccountId) {

                await this.accountService.updateAccountBalance(revenue.creditedToAccountId, -revenue.amount);

                if(revenue.userId) {
                    await this.userService.updateUserBalance(revenue.userId, revenue.amount)
                } else {
                    await this.userService.updateUserBalance(sub, amount)
                }

            // Just adjust the user's balance
            } else if(revenue.userId) {
                await this.userService.updateUserBalance(revenue.userId, adjustableAmount)
            } 
            // There was no user when revenue was created, so, credit the logged in user's account
            else {
                await this.userService.updateUserBalance(sub, amount)
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

        await this.revenueRepository.save(revenue);
        return await this.getRevenueById(id);

    }

    async deleteRevenue(id?: string): Promise<void> {
        await this.revenueRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}