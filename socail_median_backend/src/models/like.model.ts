import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Post } from './post.model';

interface LikeAttributes {
  id: number;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define which attributes are optional during creation
interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: number;
  public userId!: number;
  public postId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId'],
      },
    ],
  }
); 