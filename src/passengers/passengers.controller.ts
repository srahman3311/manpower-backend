import { 
    Body, 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Query, 
    Param 
} from "@nestjs/common";
import { PassengerService } from "./passengers.service";
import { Passenger } from "./entities/passenger.entity";
import { CreatePassengerDTO } from "./dto/create-passenger.dto";
import { QueryDTO, ParamDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/passengers") 

export class PassengerController {

    constructor(private readonly passengerService: PassengerService) {}

    @Get("")
    getPassengers(
        @Query() query: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ passengers: Passenger[], total: number }> {
        return this.passengerService.getPassengers(query, ctx);
    }

    @Get("urgent")
    getUrgentPassengers(
        @Query() query: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ passengers: Passenger[], total: number }> {
        return this.passengerService.getUrgentPassengers(query, ctx);
    }


    @Post("create")
    createPassenger(
        @Body() createPassengerDto: CreatePassengerDTO,
        @RequestContext() ctx: JwtPayload
    ) {
        return this.passengerService.createPassenger(ctx.tenantId, createPassengerDto)
    }

    @Post("create-invoice")
    async createPassengerInvoice(
        @Body() body: { passengerIds: number[] },
        @RequestContext() ctx: JwtPayload
    ): Promise<{ url: string}> {
        const fileName = await this.passengerService.createPassengerInvoice(ctx.tenantId, body);
        return {
            url: `${process.env.PUBLIC_URL}/${fileName}`
        }
    }

    @Patch(":id/edit")
    editPassenger(
        @Param() paramDto: ParamDTO, 
        @Body() createPassengerDto: CreatePassengerDTO
    ) {
        return this.passengerService.editPassenger(paramDto.id as string, createPassengerDto)
    }

    @Delete(":id/delete")
    deletePassenger(@Param() paramDto: ParamDTO): Promise<void> {
        return this.passengerService.deletePassenger(paramDto.id)
    }

}