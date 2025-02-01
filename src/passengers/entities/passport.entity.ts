import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn
} from "typeorm";

@Entity("passports")

export class Passport {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ nullable: true })
    number: string

    @Column({ nullable: true })
    date: Date

    @Column({ nullable: true })
    expiryDate: Date

    @Column({ nullable: true })
    issuingInstitute: string

    @Column({ default: false })
    deleted: boolean

}