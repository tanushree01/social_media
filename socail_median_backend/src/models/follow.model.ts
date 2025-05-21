import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

interface FollowAttributes {
  id: number;
  followerId: number;
  followingId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define which attributes are optional during creation
interface FollowCreationAttributes extends Optional<FollowAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Follow extends Model<FollowAttributes, FollowCreationAttributes> implements FollowAttributes {
  public id!: number;
  public followerId!: number;
  public followingId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Follow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Follow',
    tableName: 'follows',
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId'],
      },
    ],
  }
); 