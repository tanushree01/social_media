import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;  // User who liked
  postId: mongoose.Types.ObjectId;  // Post being liked
  createdAt?: Date;
  updatedAt?: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Post',
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    collection: 'likes',
  }
);

// Ensure each user can like a post only once
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Like = mongoose.model<ILike>('Like', LikeSchema);
export default Like;
