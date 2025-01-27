import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateJobDTO } from "./dto/create-job.dto";
import { ParamDTO, QueryDTO } from "../common/dto/param-query.dto";
import { Job } from "./jobs.entity";
import { Company } from "src/companies/companies.entity";

@Injectable()
export class JobService {

    constructor(
        @InjectRepository(Job) private jobRepository: Repository<Job>
    ) {}

    getJobById(id: number): Promise<Job | null> {
        const company = this.jobRepository.findOne({ where: { id, deleted: false } });
        return company;
    }

    async getJobs(query: QueryDTO): Promise<{ jobs: Job[], total: number }> {

        const {
            searchText = "",
            skip = "0",
            limit = "100000"
        } = query;

        // If we want to fetch the entire populated document or documents
        // const jobs = this.jobRepository.find({
        //     relations: ["visaIssuingCompany"]
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
                        AND job.deleted = false
                        `, 
                        {
                            searchText: `%${searchText}%`
                        }
                    )
                    .leftJoinAndSelect("job.visaIssuingCompany", "visaIssuingCompany")
                    .select([
                        "job", // all fields of job
                        // "job.id" // If we want certain fields of job
                        // "job.name"
                        "visaIssuingCompany.id", // certain fields of visaIssuingCompany
                        "visaIssuingCompany.name"
                    ])
                    .orderBy("job.createdAt", "DESC")
                    .skip(parseInt(skip))
                    .take(parseInt(limit))
                    .getManyAndCount()

        return { jobs, total };

    }

    createJob(createJobDto: CreateJobDTO): Promise<Job> {

        const { 
            name,
            visaName,
            visaIssuingCompanyId,
            visaQuantity,
            visaUnitPrice
        } = createJobDto;

        const job = this.jobRepository.create({
            name,
            visaName,
            visaIssuingCompany: { id: visaIssuingCompanyId } as Company,
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
            visaIssuingCompanyId,
            visaQuantity,
            visaUnitPrice
        } = paramsBody;

        const parsedId = parseInt(id as string);

        let fieldsToUpdate: Partial<Job> = {
            name,
            visaName,
            visaIssuingCompany: { id: visaIssuingCompanyId } as Company,
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