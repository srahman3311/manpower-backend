import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn, 
    ManyToOne,
    JoinColumn
} from "typeorm";
import { IsNotEmpty, Length } from "class-validator";
import { Company } from "../companies/companies.entity";

// Name of the table
@Entity("jobs") 

export class Job {
    
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ nullable: false })
    @IsNotEmpty()
    @Length(1, 255)
    name: string

    @Column({ nullable: false })
    @IsNotEmpty()
    @Length(1, 255)
    visaName: string

    // This is a plain column in the database.
    // It stores the foreign key referencing the id column of the Company table.
    @Column()
    visaIssuingCompanyId: number

    // This is a virtual field created by TypeORM.
    // It is not stored in the database but is used to define the relationship.
    // When you query the Job entity and include the company relation, TypeORM will 
    // automatically fetch and populate the company field.
    // @ManyToOne decorator to define this relationship on the Job side, 
    // because multiple jobs can belong to the same single company.
    @ManyToOne(() => Company, { nullable: false })
    @JoinColumn({ name: "visaIssuingCompanyId" })
    visaIssuingCompany: Company

    @Column({ nullable: false })
    visaQuantity: number

    @Column({ nullable: false })
    visaUnitPrice: number

    @Column({ nullable: false })
    totalPrice: number

    @Column({ default: false })
    deleted: boolean

}