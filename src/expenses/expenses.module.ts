import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense } from "./expense.entity";
import { ExpenseController } from "./expenses.controller";
import { ExpenseService } from "./expenses.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Expense])
    ],
    controllers: [ExpenseController],
    providers: [ExpenseService]
})

export class ExpenseModule {}