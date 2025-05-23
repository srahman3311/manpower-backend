import { Controller, Post, Get, Body, Patch, Param, Query, Delete } from "@nestjs/common"
import { JobService } from "./jobs.service"
import { CreateJobDTO } from "./dto/create-job.dto";
import { ParamDTO, QueryDTO } from "../global/dto/param-query.dto";
import { Job } from "./job.entity";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/jobs")

export class JobController {

    constructor(private readonly jobService: JobService) {}

    @Get(":id")
    getJobById(@Param() params: ParamDTO): Promise<Job | null> {
        const company = this.jobService.getJobById(parseInt(params.id as string));
        return company;
    }

    @Get("")
    getJobs(
        @Query() query: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{jobs: Job[], total: number }> {
        return this.jobService.getJobs(query, ctx)
    }

    @Post("create")
    createJob(
        @Body() createJobDto: CreateJobDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Job> {
        console.log(createJobDto)
        return this.jobService.createJob(ctx.tenantId, createJobDto);
    }

    @Patch(":id/edit")
    editJob(
        @Param() params: ParamDTO, 
        @Body() createJobDto: CreateJobDTO
    ): Promise<Job | null> {
        return this.jobService.editJob({...params, ...createJobDto});
    }

    @Delete(":id/delete")
    deleteJob(@Param() params: ParamDTO): { message: string } {
        this.jobService.deleteJob(parseInt(params.id as string));
        return {
            message: "deleted"
        }
    }

}