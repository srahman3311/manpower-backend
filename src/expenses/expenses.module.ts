import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense } from "./expense.entity";
import { ExpenseController } from "./expenses.controller";
import { ExpenseService } from "./expenses.service";
import { UserModule } from "src/users/users.module";
import { AccountModule } from "src/accounts/accounts.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Expense]),
        UserModule,
        AccountModule
    ],
    controllers: [ExpenseController],
    providers: [ExpenseService]
})

export class ExpenseModule {}