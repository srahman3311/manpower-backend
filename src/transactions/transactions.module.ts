import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./transaction.entity";
import { TransactionController } from "./transactions.controller";
import { TransactionService } from "./transactions.service";
import { UserModule } from "src/users/users.module";
import { AccountModule } from "src/accounts/accounts.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction]),
        UserModule,
        AccountModule
    ],
    controllers: [TransactionController],
    providers: [TransactionService]
})

export class TransactionModule {}