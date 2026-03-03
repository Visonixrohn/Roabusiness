import React from "react";

type Post = Record<string, any>;

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image}
          alt={post.title || "post"}
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {post.title || "Publicación"}
      </h3>
      <p className="text-xs text-gray-600 line-clamp-3">{post.body || ""}</p>
      {post.created_at && (
        <p className="text-xs text-gray-400 mt-2">
          {new Date(post.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default PostCard;
