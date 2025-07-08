import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { UserModel } from "./User.model";

@Entity("feature_flags")
export class FeatureFlagModel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ default: false })
  defaultValue!: boolean;

  @OneToMany("FlagRuleModel", "featureFlag", { cascade: true, eager: true })
  rules!: any[];

  @Column()
  createdBy!: string;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: "createdBy" })
  creator!: UserModel;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt!: Date;
} 