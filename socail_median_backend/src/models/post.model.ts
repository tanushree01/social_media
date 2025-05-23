import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

interface PostAttributes {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define which attributes are optional during creation
interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'imageUrl' | 'likeCount' | 'commentCount' | 'createdAt' | 'updatedAt'> {}

export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: number;
  public userId!: number;
  public content!: string;
  public imageUrl!: string;
  public likeCount!: number;
  public commentCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
  }
); 