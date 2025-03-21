import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./account.entity";
import { AccountService } from "./accounts.service";
import { AccountController } from "./accounts.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService]
})

export class AccountModule {}