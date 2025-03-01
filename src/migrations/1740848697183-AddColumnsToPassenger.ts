import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToPassenger1740848697183 implements MigrationInterface {
    name = 'AddColumnsToPassenger1740848697183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`enjazNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`visaNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`idNumber\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`idNumber\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`visaNumber\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`enjazNumber\``);
    }

}
