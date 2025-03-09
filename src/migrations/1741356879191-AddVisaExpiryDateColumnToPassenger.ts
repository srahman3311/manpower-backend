import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVisaExpiryDateColumnToPassenger1741356879191 implements MigrationInterface {
    name = 'AddVisaExpiryDateColumnToPassenger1741356879191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaExpiryDate\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaExpiryDate\``);
    }

}
