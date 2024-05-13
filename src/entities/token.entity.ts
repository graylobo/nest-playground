import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Token {
  constructor(data?: Partial<Token>) {
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
