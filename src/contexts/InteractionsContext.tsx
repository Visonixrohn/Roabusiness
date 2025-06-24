import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface Post {
  id: string;
  businessId: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[]; // Array de user IDs
  comments: Comment[];
  type: "text" | "image" | "offer" | "event";
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface InteractionsContextType {
  posts: Post[];
  getPostsByBusiness: (businessId: string) => Post[];
  createPost: (
    businessId: string,
    content: string,
    image?: string,
    type?: string
  ) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<boolean>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  isLiked: (postId: string) => boolean;
  getLikesCount: (postId: string) => number;
  getCommentsCount: (postId: string) => number;
}

const InteractionsContext = createContext<InteractionsContextType | null>(null);

export const useInteractions = () => {
  const context = useContext(InteractionsContext);
  if (!context)
    throw new Error("useInteractions must be used within InteractionsProvider");
  return context;
};

export const InteractionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Aquí puedes cargar los posts desde tu API
  }, []);

  const getPostsByBusiness = (businessId: string): Post[] => {
    return posts
      .filter((post) => post.businessId === businessId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const createPost = async (
    businessId: string,
    content: string,
    image?: string,
    type: string = "text"
  ): Promise<boolean> => {
    if (!user || user.type !== "business") return false;
    try {
      const res = await fetch(
        `http://localhost:3001/api/businesses/${businessId}/posts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Publicación", content, image }),
        }
      );
      const result = await res.json();
      return !!result.success;
    } catch (error) {
      console.error("Error creating post:", error);
      return false;
    }
  };

  const toggleLike = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          const likes = [...post.likes];
          const userIndex = likes.indexOf(user.id);

          if (userIndex > -1) {
            likes.splice(userIndex, 1); // Remove like
          } else {
            likes.push(user.id); // Add like
          }

          return { ...post, likes };
        }
        return post;
      });

      // Aquí debes llamar a tu API para actualizar los likes del post

      setPosts(updatedPosts);
      return true;
    } catch (error) {
      console.error("Error toggling like:", error);
      return false;
    }
  };

  const addComment = async (
    postId: string,
    content: string
  ): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        postId,
        userId: user.id,
        userName:
          user.type === "business"
            ? user.businessData?.name || "Negocio"
            : user.userData?.name || "Usuario",
        userAvatar:
          user.type === "business"
            ? user.businessData?.logo
            : user.userData?.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      });

      // Aquí debes llamar a tu API para agregar el comentario al post

      setPosts(updatedPosts);
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user || user.type !== "business") return false;

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.businessId !== user.businessData?.id) return false;

      const updatedPosts = posts.filter((p) => p.id !== postId);

      // Aquí debes llamar a tu API para eliminar el post

      setPosts(updatedPosts);
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  };

  const isLiked = (postId: string): boolean => {
    if (!user) return false;
    const post = posts.find((p) => p.id === postId);
    return post?.likes.includes(user.id) || false;
  };

  const getLikesCount = (postId: string): number => {
    const post = posts.find((p) => p.id === postId);
    return post?.likes.length || 0;
  };

  const getCommentsCount = (postId: string): number => {
    const post = posts.find((p) => p.id === postId);
    return post?.comments.length || 0;
  };

  return (
    <InteractionsContext.Provider
      value={{
        posts,
        getPostsByBusiness,
        createPost,
        toggleLike,
        addComment,
        deletePost,
        isLiked,
        getLikesCount,
        getCommentsCount,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  );
};
