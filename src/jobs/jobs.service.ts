import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateJobDTO } from "./dto/create-job.dto";
import { ParamDTO, QueryDTO } from "../global/dto/param-query.dto";
import { Job } from "./job.entity";
import { Company } from "src/companies/company.entity";
import { Tenant } from "src/tenants/tenant.entity";
import { JwtPayload } from "src/global/types/JwtPayload";

@Injectable()
export class JobService {

    constructor(
        @InjectRepository(Job) private jobRepository: Repository<Job>
    ) {}

    getJobById(id: number): Promise<Job | null> {
        const company = this.jobRepository.findOne({ where: { id, deleted: false } });
        return company;
    }

    async getJobs(query: QueryDTO, ctx: JwtPayload): Promise<{ jobs: Job[], total: number }> {

        const {
            searchText = "",
            skip = "0",
            limit = "100000"
        } = query;

        // If we want to fetch the entire populated document or documents
        // const jobs = this.jobRepository.find({
        //     relations: ["visaCompany"]
        // });

        // If we want certain fields, not all. 
        const [jobs, total] = await this.jobRepository
                    .createQueryBuilder("job")
                    .where(
                        `
                        (
                            job.name LIKE :searchText OR 
                            job.visaName LIKE :searchText
                        ) 
                        AND job.deleted = false AND job.tenantId = ${ctx.tenantId}
                        `, 
                        {
                            searchText: `%${searchText}%`
                        }
                    )
                    .leftJoinAndSelect("job.visaCompany", "visaCompany")
                    .select([
                        "job", // all fields of job
                        // "job.id" // If we want certain fields of job
                        // "job.name"
                        "visaCompany.id", // certain fields of visaCompany
                        "visaCompany.name"
                    ])
                    .orderBy("job.createdAt", "DESC")
                    .skip(parseInt(skip))
                    .take(parseInt(limit))
                    .getManyAndCount()

        return { jobs, total };

    }

    createJob(tenantId: number, createJobDto: CreateJobDTO): Promise<Job> {

        const { 
            name,
            visaName,
            visaType,
            expiryDate,
            visaCompanyId,
            visaQuantity,
            visaUnitPrice
        } = createJobDto;

        const job = this.jobRepository.create({
            tenant: { id: tenantId } as Tenant,
            name,
            visaName,
            visaType,
            expiryDate,
            visaCompany: { id: visaCompanyId } as Company,
            visaUnitPrice,
            visaQuantity,
            totalPrice: (visaQuantity * visaUnitPrice)
        });

        return this.jobRepository.save(job);
        
    }

    async editJob(paramsBody: CreateJobDTO & ParamDTO): Promise<Job | null> {

        const { 
            id,
            name,
            visaName,
            visaType,
            expiryDate,
            visaCompanyId,
            visaQuantity,
            visaUnitPrice
        } = paramsBody;

        const parsedId = parseInt(id as string);

        let fieldsToUpdate: Partial<Job> = {
            name,
            visaName,
            visaType,
            expiryDate: new Date(expiryDate),
            visaCompany: { id: visaCompanyId } as Company,
            visaUnitPrice,
            visaQuantity,
            totalPrice: (visaQuantity * visaUnitPrice)
        };

        const result = await this.jobRepository.update(
            { id: parsedId },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Job Not Found")
        }

        return this.jobRepository.findOne({ where: { id: parsedId } });
        
    }

    async deleteJob(id: number): Promise<void> {
        await this.jobRepository.update({ id }, { deleted: true })
    }
    
}