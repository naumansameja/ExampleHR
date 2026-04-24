import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column(DataType.STRING)
  declare name: string;

  @Column({ type: DataType.STRING, unique: true })
  declare email: string;

  @Column(DataType.STRING)
  declare hcmId: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare balance: number;
}
