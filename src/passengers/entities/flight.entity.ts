import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm";
import { Passenger } from "./passenger.entity";

@Entity("flights")

export class Flight {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    date: Date

    @Column({ nullable: true })
    airlinesName: string

    @Column({ nullable: true })
    number: string

    @Column({ nullable: true })
    departureDate: Date

    @Column({ nullable: true })
    departurePlaceAndTime: string

    @Column({ nullable: true })
    arrivalDate: Date

    @Column({ nullable: true })
    arrivalPlaceAndTime: string

    @ManyToOne(() => Passenger, (passenger) => passenger.flights, {
        onDelete: 'CASCADE',
    })
    passenger: Passenger;

}