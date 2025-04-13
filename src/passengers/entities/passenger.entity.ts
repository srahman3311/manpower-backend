import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    OneToMany,
    JoinColumn 
} from "typeorm";
import { Address } from "src/global/addresses/address.entity";
import { Agent } from "src/agents/agent.entity";
import { Job } from "src/jobs/job.entity";
import { Passport } from "./passport.entity";
import { Medical } from "./medical.entity";
import { Flight } from "./flight.entity";
import { Tenant } from "src/tenants/tenant.entity";

export enum PassengerStatus {
    Processing = "processing",
    Completed = "completed"
}

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

    @Column({ nullable: true })
    jobId: number

    @ManyToOne(() => Job, { nullable: true }) 
    @JoinColumn({ name: "jobId" }) 
    job: Job | null

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

    @Column({ nullable: true })
    enjazNumber: string

    @Column({ nullable: true })
    visaNumber: string

    @Column({ nullable: true })
    visaApplicationNumber: string

    @Column({ nullable: true })
    visaApplicationDate: Date

    @Column({ nullable: true })
    visaApplicationFingerDate: Date

    @Column({ nullable: true })
    visaIssueDate: Date

    @Column({ nullable: true })
    visaExpiryDate: Date

    @Column({ nullable: true })
    visaBMATFingerDate: Date

    @Column({ nullable: true })
    idNumber: string

    @OneToMany(() => Flight, (flight) => flight.passenger, {
        cascade: true,
    })
    flights: Flight[];

    @Column({ default: 0 })
    cost: number

    @Column({ default: 0 })
    sale: number

    @Column({ default: "processing" })
    status: string

    @Column({ default: false })
    deleted: boolean

}
