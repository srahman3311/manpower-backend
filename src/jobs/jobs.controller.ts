import { Controller, Post, Get, Body, Patch, Param, Query, Delete } from "@nestjs/common"
import { JobService } from "./jobs.service"
import { CreateJobDTO } from "./dto/create-job.dto";
import { ParamDTO, QueryDTO } from "../common/dto/param-query.dto";
import { Job } from "./jobs.entity";

@Controller("api/jobs")

export class JobController {

    constructor(private readonly jobService: JobService) {}

    @Get(":id")
    getJobById(@Param() params: ParamDTO): Promise<Job | null> {
        const company = this.jobService.getJobById(parseInt(params.id as string));
        return company;
    }

    @Get("")
    getJobs(@Query() query: QueryDTO): Promise<{jobs: Job[], total: number }> {
        return this.jobService.getJobs(query)
    }

    @Post("create")
    createJob(@Body() createJobDto: CreateJobDTO): Promise<Job> {
        return this.jobService.createJob(createJobDto);
    }

    @Patch("edit/:id")
    editJob(
        @Param() params: ParamDTO, 
        @Body() createJobDto: CreateJobDTO
    ): Promise<Job | null> {
        return this.jobService.editJob({...params, ...createJobDto});
    }

    @Delete(":id")
    deleteJob(@Param() params: ParamDTO): { message: string } {
        this.jobService.deleteJob(parseInt(params.id as string));
        return {
            message: "deleted"
        }
    }

}