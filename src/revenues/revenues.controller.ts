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
// import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";

@Controller("api/revenues")

export class RevenueController {

    constructor(private readonly revenueService: RevenueService) {}

    // @UseGuards(AuthGuard)
    @Get("me")
    getAuthUser(@Req() request: Request) {
        const id = (request as any).user.sub;
        return this.revenueService.getRevenueById(id)
    }

    // @UseGuards(AuthGuard)
    @Get("")
    getRevenues(@Query() queryDto: QueryDTO): Promise<{ revenues: Revenue[], total: number }> {
        return this.revenueService.getRevenues(queryDto)
    }

    // @UseGuards(AuthGuard)
    @Post("create")
    createRevenue(@Body() createRevenueDto: CreateRevenueDTO): Promise<Revenue> {
        return this.revenueService.createRevenue(createRevenueDto);
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