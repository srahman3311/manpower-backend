import { 
    Controller, 
    Req,
    Get, 
    Post, 
    Patch, 
    Body,
    UseGuards, 
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { Request } from "express";
import { RevenueService } from "./revenues.service";
import { CreateRevenueDTO } from "./dto/create-revenue.dto";
import { Revenue } from "./revenue.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/revenues")

export class RevenueController {

    constructor(private readonly revenueService: RevenueService) {}

    @UseGuards(AuthGuard)
    @Get("")
    getRevenues(@Query() queryDto: QueryDTO, @RequestContext() ctx: JwtPayload, @Req() request: any): Promise<{ revenues: Revenue[], total: number }> {
        // console.log(ctx)
        console.log({user: request.user})
        return this.revenueService.getRevenues(queryDto, ctx)
    }

    // @UseGuards(AuthGuard)
    @Post("create")
    createRevenue(
        @Body() createRevenueDto: CreateRevenueDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Revenue> {
        return this.revenueService.createRevenue(ctx.tenantId, createRevenueDto);
    }

    @Patch(":id/edit")
    editRevenue(
        @Param() paramDto: ParamDTO, 
        @Body() createRevenueDto: CreateRevenueDTO
    ): Promise<Revenue | null> {
        const { 
            name,
            description,
            amount,
            jobId, 
            passengerId 
        } = createRevenueDto;
        return this.revenueService.editRevenue(
            parseInt(paramDto.id as string), 
            { 
                name,
                description,
                amount,
                jobId, 
                passengerId 
            }
        )
    }

    // @UseGuards(AuthGuard)
    @Delete(":id/delete")
    deleteRevenue(@Param() paramDto: ParamDTO): Promise<void> {
        return this.revenueService.deleteRevenue(paramDto.id)
    }

}