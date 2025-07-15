import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { RuleType } from "@infrastructure/web/types/Api.types";

@Entity("flag_rules")
export class FlagRuleModel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: RuleType
  })
  type!: RuleType;

  @OneToMany("FlagConditionModel", "rule", { cascade: true, eager: true })
  conditions!: any[];

  @Column()
  value!: boolean;

  @Column()
  priority!: number;

  @ManyToOne("FeatureFlagModel", "rules", { onDelete: 'CASCADE' })
  featureFlag!: any;
} 