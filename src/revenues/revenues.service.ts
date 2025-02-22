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

@Injectable()

export class RevenueService {

    constructor(
        @InjectRepository(Revenue) private readonly revenueRepository: Repository<Revenue>
    ) {}

    async getRevenueById(id: number): Promise<Revenue | null> {
        return await this.revenueRepository.findOne({ 
            where: { id },
            relations: ["tenant", "job", "passenger"]  
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
                            .leftJoinAndSelect("revenue.passenger", "passenger")
                            .orderBy("revenue.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { revenues, total };

    }

    async createRevenue(tenantId: number, createRevenueDto: CreateRevenueDTO): Promise<Revenue> {

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createRevenueDto;

        const revenue = this.revenueRepository.create({
            tenant: { id: tenantId } as Tenant,
            job: jobId ? { id: jobId } as Job : undefined,
            passenger: passengerId ? { id: passengerId } as Passenger : undefined,
            name,
            description,
            amount
        })

        return this.revenueRepository.save(revenue);

    }

    async editRevenue(id: number, createRevenueDto: Omit<CreateRevenueDTO, "tenantId">): Promise<Revenue | null> {

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createRevenueDto;

        const revenue = await this.getRevenueById(id);
        if(!revenue) throw new NotFoundException("Revenue Not Found");
        
        revenue.name = name;
        revenue.amount = amount;

        if(description) {
            revenue.description = description;
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