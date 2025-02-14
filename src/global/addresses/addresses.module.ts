import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Address } from "./address.entity";
import { AddressService } from "./addresses.service";

@Module({
    imports: [TypeOrmModule.forFeature([Address])],
    providers: [AddressService],
    exports: [AddressService]
})

export class AddressModule {}