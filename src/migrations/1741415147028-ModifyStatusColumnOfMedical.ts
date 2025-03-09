import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyStatusColumnOfMedical1741415147028 implements MigrationInterface {
    name = 'ModifyStatusColumnOfMedical1741415147028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medicals\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'processing'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medicals\` CHANGE \`status\` \`status\` varchar(255) NULL`);
    }

}
