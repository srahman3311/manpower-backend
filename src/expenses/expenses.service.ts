import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,  
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository} from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { Job } from "src/jobs/job.entity";
import { Passenger } from "src/passengers/entities/passenger.entity";
import { CreateExpenseDTO } from "./dto/create-expense.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { ParamDTO } from "src/global/dto/param-query.dto";
import { Expense } from "./expense.entity";

@Injectable()

export class ExpenseService {

    constructor(
        @InjectRepository(Expense) private readonly expenseRepository: Repository<Expense>
    ) {}

    async getExpenseById(id: number): Promise<Expense | null> {
        return await this.expenseRepository.findOne({ 
            where: { id },
            relations: ["tenant", "job", "passenger"]  
        });
    }

    async getExpenses(query: QueryDTO): Promise<{ expenses: Expense[], total: number }> {

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
                                ) AND expense.deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("expense.tenant", "tenant")
                            .leftJoinAndSelect("expense.job", "job")
                            .leftJoinAndSelect("expense.passenger", "passenger")
                            .orderBy("expense.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { expenses, total };

    }

    async createExpense(createExpenseDto: CreateExpenseDTO): Promise<Expense> {

        const { 
            tenantId,
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createExpenseDto;

        const expense = this.expenseRepository.create({
            tenant: { id: tenantId } as Tenant,
            job: jobId ? { id: jobId } as Job : undefined,
            passenger: passengerId ? { id: passengerId } as Passenger : undefined,
            name,
            description,
            amount
        })

        return this.expenseRepository.save(expense);

    }

    async editExpense(id: number, createExpenseDto: Omit<CreateExpenseDTO, "tenantId">): Promise<Expense | null> {

        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createExpenseDto;

        const expense = await this.getExpenseById(id);
        if(!expense) throw new NotFoundException("Expense Not Found");

        let fieldsToUpdate: Partial<Expense> = { 
            name,
            description,
            amount
            // ...createExpenseDto,
            // job: jobId ? { id: jobId } as Job : undefined,
            // passenger: passengerId ? { id: passengerId } as Passenger : undefined,
        };

        if(expense.job && !jobId) {
            expense.job = null
        }

        if(expense.passenger && !passengerId) {
            expense.passenger = null
        }
        
        const result = await this.expenseRepository.update(
            { id },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Expense Not Found")
        }

        await this.expenseRepository.save(expense);
    
        return this.expenseRepository.findOne({ where: { id } });

    }

    async deleteExpense(id?: string): Promise<void> {
        await this.expenseRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}