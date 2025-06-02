import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;   // User who follows
  followingId: mongoose.Types.ObjectId;  // User being followed
  createdAt?: Date;
  updatedAt?: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    followingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,           // adds/maintains createdAt & updatedAt
    collection: 'follows',      // matches your Sequelize tableName
  }
);

// Compound-unique index to prevent duplicate “follower → following” pairs
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = mongoose.model<IFollow>('Follow', FollowSchema);
export default Follow;
