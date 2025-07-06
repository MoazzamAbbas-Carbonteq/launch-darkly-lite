import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("flags")
export class Flag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column()
  projectId!: string;

  @Column({ default: false })
  archived!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
} 