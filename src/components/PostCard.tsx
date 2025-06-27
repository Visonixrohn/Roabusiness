import { Link } from "react-router-dom";
import { MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: {
    id: string;
    business_id: string;
    title: string;
    content: string;
    image?: string;
    created_at: string;
    business_name: string;
    business_logo: string;
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const userId = user?.id || "";
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-xs w-full mx-auto p-2">
      {/* Encabezado del post con info del negocio */}
      <div className="p-2 flex items-center space-x-2">
        <Link to={`/negocio/${post.business_id}`}>
          <img
            src={post.business_logo}
            alt={post.business_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link
            to={`/negocio/${post.business_id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 text-sm"
          >
            {post.business_name}
          </Link>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="px-2 pb-2">
        <h3 className="font-semibold text-gray-900 mb-1 text-base line-clamp-1">
          {post.title}
        </h3>
        <p className="text-gray-600 text-xs line-clamp-2">{post.content}</p>
      </div>

      {/* Imagen del post si existe */}
      {post.image && (
        <div className="relative aspect-video">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover rounded"
          />
        </div>
      )}

      {/* Footer con interacciones */}
      <div className="px-2 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="p-1" disabled>
              <Heart className="h-4 w-4" />
              <span className="ml-1">{post.likes_count || 0}</span>
            </Button>
            <Button variant="ghost" size="icon" className="p-1" disabled>
              <MessageSquare className="h-4 w-4" />
              <span className="ml-1">{post.comments_count || 0}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
