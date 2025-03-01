import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBalanceColumnToUser1740675975622 implements MigrationInterface {
    name = 'AddBalanceColumnToUser1740675975622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`balance\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`balance\``);
    }

}
