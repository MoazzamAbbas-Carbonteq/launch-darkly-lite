import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ConditionOperator } from "@infrastructure/web/types/Api.types";

@Entity("flag_conditions")
export class FlagConditionModel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  field!: string;

  @Column({
    type: "enum",
    enum: ConditionOperator
  })
  operator!: ConditionOperator;

  @Column({ type: "text" })
  value!: string;

  @ManyToOne("FlagRuleModel", "conditions", { onDelete: 'CASCADE' })
  rule!: any;
} 