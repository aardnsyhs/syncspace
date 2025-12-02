import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: number;
  name: string;
  email: string;
}

export interface TeamMember {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface Comment {
  id: number;
  body: string;
  user: User;
  created_at: string;
}

interface Props {
  comments: Comment[];
  currentUserId: number;
  teamMembers?: TeamMember[];
  onAddComment: (body: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  isLoading?: boolean;
}

export function CommentsSection({
  comments,
  currentUserId,
  teamMembers = [],
  onAddComment,
  onDeleteComment,
  isLoading = false,
}: Props) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setNewComment(value);
    setCursorPosition(position);

    // Check for @ mention trigger
    const textBeforeCursor = value.slice(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: TeamMember) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const textAfterCursor = newComment.slice(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    const newText =
      textBeforeCursor.slice(0, mentionStart) +
      `@${member.name} ` +
      textAfterCursor;

    setNewComment(newText);
    setShowMentions(false);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = mentionStart + member.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMembers.length - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowMentions(false);
    if (showMentions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMentions]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render comment body with highlighted mentions
  const renderCommentBody = (body: string) => {
    const parts = body.split(/(@\w+(?:\s\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment... Use @ to mention"
          className="w-full min-h-[80px] p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-background border rounded-md shadow-lg z-50">
            <ScrollArea className="max-h-40">
              {filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted ${
                    index === mentionIndex ? "bg-muted" : ""
                  }`}
                  onClick={() => insertMention(member)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </button>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Ctrl+Enter to send
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          Send
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={comment.user.id === currentUserId}
              onDelete={() => onDeleteComment(comment.id)}
              getInitials={getInitials}
              renderBody={renderCommentBody}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onDelete: () => void;
  getInitials: (name: string) => string;
  renderBody: (body: string) => React.ReactNode;
}

function CommentItem({
  comment,
  isOwner,
  onDelete,
  getInitials,
  renderBody,
}: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {getInitials(comment.user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </span>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-auto"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              )}
            </Button>
          )}
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">
          {renderBody(comment.body)}
        </p>
      </div>
    </div>
  );
}
