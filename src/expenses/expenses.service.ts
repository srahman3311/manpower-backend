import { 
    Injectable, 
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository} from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { Job } from "src/jobs/job.entity";
import { Passenger } from "src/passengers/entities/passenger.entity";
import { CreateExpenseDTO } from "./dto/create-expense.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { Expense } from "./expense.entity";
import { JwtPayload } from "src/global/types/JwtPayload";

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
                            .orderBy("expense.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { expenses, total };

    }

    async createExpense(tenantId: number, createExpenseDto: CreateExpenseDTO): Promise<Expense> {

        const { 
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
        };

        if(expense.job && !jobId) {
            expense.job = null
        }

        if(expense.passenger && !passengerId) {
            expense.passenger = null
        }

        await this.expenseRepository.save(expense);
        
        const result = await this.expenseRepository.update(
            { id },
            fieldsToUpdate
        )
        console.log({ result })

        if(result.affected === 0) {
            throw new NotFoundException("Expense Not Found")
        }
    
        return this.expenseRepository.findOne({ where: { id } });

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
        await this.expenseRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}