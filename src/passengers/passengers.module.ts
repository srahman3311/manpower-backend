import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassengerController } from "./passengers.controller";
import { Passenger } from "./entities/passenger.entity";
import { Medical } from "./entities/medical.entity";
import { Passport } from "./entities/passport.entity";
import { PassengerService } from "./passengers.service";
import { AddressModule } from "src/global/addresses/addresses.module";
import { TenantModule } from "src/tenants/tenants.module";
import { Flight } from "./entities/flight.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Passenger, Medical, Passport, Flight]), 
        AddressModule,
        TenantModule
    ],
    controllers: [PassengerController],
    providers: [PassengerService]
})

export class PassengerModule {}