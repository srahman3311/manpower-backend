import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn 
} from "typeorm";
import { Address } from "src/global/addresses/address.entity";
import { Agent } from "src/agents/agent.entity";
import { Job } from "src/jobs/job.entity";
import { Passport } from "./passport.entity";
import { Medical } from "./medical.entity";
import { Tenant } from "src/tenants/tenant.entity";

@Entity("passengers")

export class Passenger {

    @Column()
    tenantId: number

    @ManyToOne(() => Tenant) 
    @JoinColumn({ name: "tenantId" }) 
    tenant: Tenant

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column()
    name: string

    @Column({ unique: true })
    phone: string 

    @Column({ nullable: true })
    email: string

    @Column({ nullable: true })
    birthDate: Date

    @Column({ nullable: true })
    age: number

    @Column({ nullable: true })
    fatherName: string

    @Column({ nullable: true })
    motherName: string

    @Column({ nullable: true })
    nationalId: string

    @Column({ nullable: true })
    occupation: string

    @Column({ nullable: true })
    weight: string

    @Column({ nullable: true })
    height: string

    @Column({ nullable: true })
    experience: string

    @Column({ nullable: true })
    imageUrl: string

    @Column()
    addressId: number

    @ManyToOne(() => Address, { nullable: true }) 
    @JoinColumn({ name: "addressId" }) 
    address: Address

    @Column()
    jobId: number

    @ManyToOne(() => Job) 
    @JoinColumn({ name: "jobId" }) 
    job: Job

    @Column()
    agentId: number

    @ManyToOne(() => Agent) 
    @JoinColumn({ name: "agentId" }) 
    agent: Agent

    @Column()
    passportId: number

    @OneToOne(() => Passport) 
    @JoinColumn({ name: "passportId" }) 
    passport: Passport

    @Column()
    medicalId: number

    @OneToOne(() => Medical) 
    @JoinColumn({ name: "medicalId" }) 
    medical: Medical

    @Column({ default: false })
    deleted: boolean

}
