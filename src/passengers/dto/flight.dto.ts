import { IsString, IsOptional, IsNumber } from "class-validator";

export class FlightDTO {

    @IsOptional()
    @IsNumber()
    id: number

    @IsOptional()
    @IsString()
    date: string

    @IsOptional()
    @IsString()
    airlinesName: string

    @IsOptional()
    @IsString()
    number: string

    @IsOptional()
    @IsString()
    departureDate: string

    @IsOptional()
    @IsString()
    departurePlaceAndTime: string

    @IsOptional()
    @IsString()
    arrivalDate: string

    @IsOptional()
    @IsString()
    arrivalPlaceAndTime: string

}
