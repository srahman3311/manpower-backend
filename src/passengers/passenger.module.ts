import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassengerController } from "./passenger.controller";
import { Passenger } from "./entities/passenger.entity";
import { Medical } from "./entities/medical.entity";
import { Passport } from "./entities/passport.entity";
import { PassengerService } from "./passenger.service";
import { AddressModule } from "src/common/addresses/address.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Passenger, Medical, Passport]), 
        AddressModule
    ],
    controllers: [PassengerController],
    providers: [PassengerService]
})

export class PassengerModule {}