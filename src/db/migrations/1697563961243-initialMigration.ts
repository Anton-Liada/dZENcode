import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1697563961243 implements MigrationInterface {
  name = 'InitialMigration1697563961243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "username" character varying NOT NULL DEFAULT '', "email_address" character varying NOT NULL DEFAULT '', "password" character varying DEFAULT '', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
