import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./companies.entity";

@Injectable()

export class CompanyService {

    constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

    getCompanyById(id: number): Promise<Company | null> {
        const company = this.companyRepository.findOne({ where: { id } });
        return company;
    }

    getCompanies() {
        const companies = this.companyRepository.find({ where: { id: 13 } });
        return companies;
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