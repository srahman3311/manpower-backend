import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountDTO } from "./dto/create-accoount.dto";
import { Account } from "./account.entity";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { ParamDTO } from "src/global/dto/param-query.dto";
import { JwtPayload } from "src/global/types/JwtPayload";

@Injectable()
export class AccountService {

    constructor(
        @InjectRepository(Account) private accountRepository: Repository<Account>
    ) {}

    getAccountById(id: number): Promise<Account | null> {
        const account = this.accountRepository.findOne({ 
            where: { id },
            relations: ["tenant"]  
        });
        return account;
    }

    async getAccounts(query: QueryDTO, ctx: JwtPayload): Promise<{ accounts: Account[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [accounts, total] = await this.accountRepository
                            .createQueryBuilder("account")
                            .where(
                                `(
                                    account.name LIKE :searchText OR 
                                    account.bankName LIKE :searchText 
                                ) AND account.deleted = false AND account.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("account.tenant", "tenant")
                            .orderBy("account.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { accounts, total };
    
    }

    async createAccount(tenantId: number, createAccountDto: CreateAccountDTO): Promise<Account> {
        const account = this.accountRepository.create({
            tenantId,
            ...createAccountDto,
         
        });
        return this.accountRepository.save(account);
    }

    async editAccount(paramsBody: CreateAccountDTO & ParamDTO): Promise<Account | null> {
    
        const { 
            id,
            name, 
            bankName
        } = paramsBody;

        const parsedId = parseInt(id as string);

        let fieldsToUpdate: Partial<Account> = {
            name, 
            bankName
        };

        const result = await this.accountRepository.update(
            { id: parsedId },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Account Not Found")
        }

        return this.accountRepository.findOne({ where: { id: parsedId } });
            
    }
    
    async deleteAccount(id?: string): Promise<void> {
        await this.accountRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}