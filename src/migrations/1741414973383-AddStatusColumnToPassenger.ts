import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusColumnToPassenger1741414973383 implements MigrationInterface {
    name = 'AddStatusColumnToPassenger1741414973383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'processing'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`status\``);
    }

}
