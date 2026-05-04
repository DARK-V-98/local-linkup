import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  Timestamp 
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLevel?: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: any[];
  createdAt: any;
}

export default function Feed() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: userData?.name || user.displayName || "Anonymous",
        userAvatar: user.photoURL || "",
        userLevel: userData?.level || "Level 1",
        content: newPost,
        likes: [],
        comments: [],
        createdAt: Timestamp.now(),
      });
      setNewPost("");
      toast({ title: "Post shared!", description: "Your update is now live on the feed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto pt-32 pb-20 px-4 max-w-2xl">
        {/* Create Post Section */}
        {user && userData?.role === "Seller" && (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 mb-4">
              <Avatar className="w-12 h-12 border-2 border-primary/10">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="bg-gradient-brand text-white font-black grid place-items-center">
                  {(userData?.name || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-black text-slate-900 mb-1">What's new, {userData?.name?.split(' ')[0]}?</div>
                <Textarea 
                  placeholder="Share a service update, recent project, or special offer..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="bg-slate-50 border-none rounded-2xl resize-none min-h-[100px] focus-visible:ring-primary p-4 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500 hover:text-primary px-3 flex items-center justify-center gap-2">
                   <div className="w-6 h-6 grid place-items-center">
                      <i className="fas fa-image text-primary" />
                   </div>
                   <span className="text-xs">Image</span>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500 hover:text-secondary px-3 flex items-center justify-center gap-2">
                   <div className="w-6 h-6 grid place-items-center">
                      <i className="fas fa-video text-secondary" />
                   </div>
                   <span className="text-xs">Video</span>
                </Button>
              </div>
              <Button 
                onClick={handlePostSubmit} 
                disabled={loading || !newPost.trim()}
                className="bg-slate-900 text-white rounded-xl px-8 h-10 font-black text-xs uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 grid place-items-center">
                    <i className="fas fa-spinner fa-spin" />
                  </div>
                ) : (
                  <div className="w-4 h-4 grid place-items-center">
                    <i className="fas fa-paper-plane" />
                  </div>
                )}
                Post Update
              </Button>
            </div>
          </div>
        )}

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={() => handleLike(post.id, post.likes.includes(user?.uid || ""))}
              currentUserId={user?.uid}
            />
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl grid place-items-center mx-auto mb-4">
                  <i className="fas fa-rss text-slate-300 text-2xl" />
               </div>
               <h3 className="text-lg font-black text-slate-900">No posts yet</h3>
               <p className="text-slate-500 font-medium">Be the first to share an update!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PostCard({ post, onLike, currentUserId }: { post: Post; onLike: () => void; currentUserId?: string }) {
  const [showComments, setShowComments] = useState(false);
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
      {/* Post Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-primary/10">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback className="bg-slate-100 text-slate-500 font-black uppercase text-xs grid place-items-center">
              {post.userName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-black text-slate-900 text-sm">{post.userName}</h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0">
                {post.userLevel || "Level 1"}
              </Badge>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {post.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-300 hover:text-slate-900 grid place-items-center">
           <i className="fas fa-ellipsis" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLike}
            className={`rounded-xl px-4 h-10 font-bold transition-all flex items-center justify-center gap-2 ${
              isLiked ? "text-primary bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
            }`}
          >
            <div className="w-5 h-5 grid place-items-center">
              <i className={`fa-heart ${isLiked ? "fas" : "far"} transition-transform active:scale-150`} />
            </div>
            <span className="text-xs">{post.likes.length || ""}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="rounded-xl px-4 h-10 font-bold text-slate-500 hover:text-secondary hover:bg-secondary/5 flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 grid place-items-center">
              <i className="far fa-comment" />
            </div>
            <span className="text-xs">{post.comments.length || ""}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl px-4 h-10 font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 grid place-items-center">
              <i className="far fa-share-nodes" />
            </div>
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl h-10 border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 px-6"
        >
          <div className="w-5 h-5 grid place-items-center">
            <i className="fas fa-envelope text-[12px]" />
          </div>
          Contact Pro
        </Button>
      </div>

      {/* Comments Section (Expandable) */}
      {showComments && (
        <div className="p-6 bg-slate-50/30 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex gap-3 mb-6">
              <Avatar className="w-8 h-8 border border-slate-200">
                <AvatarFallback className="bg-white text-slate-400 text-[10px] font-black uppercase grid place-items-center">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                 <Input 
                   placeholder="Write a comment..." 
                   className="bg-white border-slate-200 rounded-xl h-9 text-xs focus-visible:ring-primary"
                 />
                 <Button size="sm" className="h-9 rounded-xl px-4 bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    Reply
                 </Button>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="text-center py-4">
                 <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No comments yet</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
