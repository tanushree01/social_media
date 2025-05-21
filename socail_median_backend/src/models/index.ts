import { User } from './user.model';
import { Post } from './post.model';
import { Comment } from './comment.model';
import { Like } from './like.model';
import { Follow } from './follow.model';

// User <-> Post associations
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// User <-> Comment associations
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Post <-> Comment associations
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// User <-> Like associations
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

// Post <-> Like associations
Post.hasMany(Like, { foreignKey: 'postId' });
Like.belongsTo(Post, { foreignKey: 'postId' });

// User <-> Follow associations (as follower)
User.hasMany(Follow, { foreignKey: 'followerId', as: 'Following' });
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'Follower' });

// User <-> Follow associations (as being followed)
User.hasMany(Follow, { foreignKey: 'followingId', as: 'Followers' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'Following' });

export {
  User,
  Post,
  Comment,
  Like,
  Follow
}; 