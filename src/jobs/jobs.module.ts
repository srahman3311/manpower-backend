import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobController } from "./jobs.controller";
import { JobService } from "./jobs.service";

@Module({
    imports: [TypeOrmModule.forFeature([Job])],
    controllers: [JobController],
    providers: [JobService]
})

export class JobModule {}