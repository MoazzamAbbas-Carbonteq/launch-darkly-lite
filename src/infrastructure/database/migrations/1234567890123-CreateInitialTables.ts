import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1234567890123 implements MigrationInterface {
    name = 'CreateInitialTables1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "email" character varying NOT NULL, 
                "password" character varying NOT NULL, 
                "name" character varying NOT NULL, 
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "flags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying NOT NULL, 
                "key" character varying NOT NULL, 
                "description" text, 
                "projectId" character varying NOT NULL, 
                "archived" boolean NOT NULL DEFAULT false, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_flags_key" UNIQUE ("key"), 
                CONSTRAINT "PK_flags_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."feature_flags_rule_type_enum" AS ENUM('user_id', 'email', 'role', 'percentage', 'custom_attribute')
        `);
        await queryRunner.query(`
            CREATE TABLE "feature_flags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "key" character varying NOT NULL, 
                "name" character varying NOT NULL, 
                "description" text, 
                "enabled" boolean NOT NULL DEFAULT true, 
                "defaultValue" boolean NOT NULL DEFAULT false, 
                "createdBy" character varying NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "expiresAt" TIMESTAMP, 
                CONSTRAINT "UQ_feature_flags_key" UNIQUE ("key"), 
                CONSTRAINT "PK_feature_flags_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."flag_rules_type_enum" AS ENUM('user_id', 'email', 'role', 'percentage', 'custom_attribute')
        `);
        await queryRunner.query(`
            CREATE TABLE "flag_rules" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "type" "public"."flag_rules_type_enum" NOT NULL, 
                "value" boolean NOT NULL, 
                "priority" integer NOT NULL, 
                "featureFlagId" uuid, 
                CONSTRAINT "PK_flag_rules_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."flag_conditions_operator_enum" AS ENUM('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in')
        `);
        await queryRunner.query(`
            CREATE TABLE "flag_conditions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "field" character varying NOT NULL, 
                "operator" "public"."flag_conditions_operator_enum" NOT NULL, 
                "value" text NOT NULL, 
                "ruleId" uuid, 
                CONSTRAINT "PK_flag_conditions_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "feature_flags" ADD CONSTRAINT "FK_feature_flags_createdBy" 
            FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flag_rules" ADD CONSTRAINT "FK_flag_rules_featureFlag" 
            FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flag_conditions" ADD CONSTRAINT "FK_flag_conditions_rule" 
            FOREIGN KEY ("ruleId") REFERENCES "flag_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flag_conditions" DROP CONSTRAINT "FK_flag_conditions_rule"`);
        await queryRunner.query(`ALTER TABLE "flag_rules" DROP CONSTRAINT "FK_flag_rules_featureFlag"`);
        await queryRunner.query(`ALTER TABLE "feature_flags" DROP CONSTRAINT "FK_feature_flags_createdBy"`);
        await queryRunner.query(`DROP TABLE "flag_conditions"`);
        await queryRunner.query(`DROP TYPE "public"."flag_conditions_operator_enum"`);
        await queryRunner.query(`DROP TABLE "flag_rules"`);
        await queryRunner.query(`DROP TYPE "public"."flag_rules_type_enum"`);
        await queryRunner.query(`DROP TABLE "feature_flags"`);
        await queryRunner.query(`DROP TYPE "public"."feature_flags_rule_type_enum"`);
        await queryRunner.query(`DROP TABLE "flags"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
} 