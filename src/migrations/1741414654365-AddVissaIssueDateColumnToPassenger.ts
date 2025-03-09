import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVissaIssueDateColumnToPassenger1741414654365 implements MigrationInterface {
    name = 'AddVissaIssueDateColumnToPassenger1741414654365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaIssueDate\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaIssueDate\``);
    }

}
