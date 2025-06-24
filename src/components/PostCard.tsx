import { Link } from "react-router-dom";
import { MessageSquare, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostCardProps {
  post: {
    id: number;
    business_id: number;
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
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Encabezado del post con info del negocio */}
      <div className="p-4 flex items-center space-x-3">
        <Link to={`/negocio/${post.business_id}`}>
          <img
            src={post.business_logo}
            alt={post.business_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link
            to={`/negocio/${post.business_id}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
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
      <div className="px-4 pb-3">
        <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-600 text-sm">{post.content}</p>
      </div>

      {/* Imagen del post si existe */}
      {post.image && (
        <div className="relative aspect-video">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Footer con interacciones */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments_count || 0}</span>
            </Button>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <Eye className="h-4 w-4" />
            <span>{post.views_count || 0} vistas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
