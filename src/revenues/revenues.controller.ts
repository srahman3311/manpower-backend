import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Body,
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { RevenueService } from "./revenues.service";
import { CreateRevenueDTO } from "./dto/create-revenue.dto";
import { Revenue } from "./revenue.entity";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/revenues")

export class RevenueController {

    constructor(private readonly revenueService: RevenueService) {}

    @Get("")
    getRevenues(
        @Query() queryDto: QueryDTO, 
        @RequestContext() ctx: JwtPayload
    ): Promise<{ revenues: Revenue[], total: number }> {
        return this.revenueService.getRevenues(queryDto, ctx)
    }

    @Post("create")
    createRevenue(
        @Body() createRevenueDto: CreateRevenueDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Revenue> {
        return this.revenueService.createRevenue(ctx, createRevenueDto);
    }

    @Patch(":id/edit")
    editRevenue(
        @Param() paramDto: ParamDTO, 
        @Body() createRevenueDto: CreateRevenueDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Revenue | null> {
        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId,
            creditedToAccountId 
        } = createRevenueDto;
        return this.revenueService.editRevenue(
            parseInt(paramDto.id as string), 
            { 
                name,
                description,
                amount,
                jobId, 
                passengerId,
                creditedToAccountId 
            },
            ctx
        )
    }

    @Delete(":id/delete")
    deleteRevenue(@Param() paramDto: ParamDTO): Promise<void> {
        return this.revenueService.deleteRevenue(paramDto.id)
    }

}