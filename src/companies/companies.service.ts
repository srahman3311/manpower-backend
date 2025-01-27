import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./companies.entity";
import { QueryDTO } from "src/common/dto/param-query.dto";
import { ParamDTO } from "src/common/dto/param-query.dto";

@Injectable()

export class CompanyService {

    constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

    getCompanyById(id: number): Promise<Company | null> {
        const company = this.companyRepository.findOne({ where: { id } });
        return company;
    }

    async getCompanies(query: QueryDTO): Promise<{ companies: Company[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [companies, total] = await this.companyRepository
                            .createQueryBuilder("company")
                            .where(
                                `(
                                    company.name LIKE :searchText OR 
                                    company.email LIKE :searchText OR 
                                    company.phone LIKE :searchText OR 
                                    company.address LIKE :searchText 

                                ) AND deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .orderBy("company.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { companies, total };
    
    }

    async createCompany(createCompanyDto: CreateCompanyDTO): Promise<Company> {
        console.log(createCompanyDto)
        const company = this.companyRepository.create({
            ...createCompanyDto,
            phone: createCompanyDto.phone ?? null,
            address: createCompanyDto.address ?? null
        });
        const errors = await validate(company);
        console.log(errors);
        return this.companyRepository.save(company);
    }

}