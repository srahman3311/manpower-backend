import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFlightColumnsToPassengers1744395539665 implements MigrationInterface {
    name = 'AddFlightColumnsToPassengers1744395539665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`flights\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` datetime NULL, \`airlinesName\` varchar(255) NULL, \`number\` varchar(255) NULL, \`departureDate\` datetime NULL, \`departurePlaceAndTime\` varchar(255) NULL, \`arrivalDate\` datetime NULL, \`arrivalPlaceAndTime\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaApplicationNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaApplicationDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaApplicationFingerDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaBMATFingerDate\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaBMATFingerDate\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaApplicationFingerDate\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaApplicationDate\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaApplicationNumber\``);
        await queryRunner.query(`DROP TABLE \`flights\``);
    }

}
