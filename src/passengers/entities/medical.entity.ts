import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn
} from "typeorm";

export enum MedicalStatus {
    Processing = "processing",
    Completed = "completed"
}

@Entity("medicals")

export class Medical {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ nullable: true })
    date: Date

    @Column({ nullable: true })
    expiryDate: Date

    @Column({ default: "processing" })
    status: string

    @Column({ default: false })
    deleted: boolean

}