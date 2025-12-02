import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Paperclip,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  FileText,
  Image,
  File,
  Link,
} from "lucide-react";
import type { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onUpload: (file: File) => Promise<void>;
  onAddExternal: (url: string, fileName: string) => Promise<void>;
  onDelete: (attachmentId: number) => Promise<void>;
}

export function AttachmentList({
  attachments,
  onUpload,
  onAddExternal,
  onDelete,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<"file" | "url">("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalName, setExternalName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
      setIsAdding(false);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddExternal = async () => {
    if (!externalUrl.trim() || !externalName.trim()) return;

    setIsUploading(true);
    try {
      await onAddExternal(externalUrl.trim(), externalName.trim());
      setExternalUrl("");
      setExternalName("");
      setIsAdding(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="h-4 w-4" />
          Attachments
          {attachments.length > 0 && (
            <span className="text-muted-foreground">
              ({attachments.length})
            </span>
          )}
        </div>
        {!isAdding && (
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex gap-2">
            <Button
              variant={addMode === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setAddMode("file")}
            >
              <File className="h-4 w-4 mr-1" />
              Upload
            </Button>
            <Button
              variant={addMode === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setAddMode("url")}
            >
              <Link className="h-4 w-4 mr-1" />
              Link
            </Button>
          </div>

          {addMode === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
              />
              <Input
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
                placeholder="Display name"
              />
              <Button
                size="sm"
                onClick={handleAddExternal}
                disabled={
                  !externalUrl.trim() || !externalName.trim() || isUploading
                }
              >
                Add link
              </Button>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      )}

      {attachments.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">No attachments yet</p>
      )}

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete: (id: number) => void;
}

function AttachmentItem({ attachment, onDelete }: AttachmentItemProps) {
  const Icon = getFileIcon(attachment.mime_type);

  return (
    <div className="flex items-center gap-3 p-2 border rounded-lg group hover:bg-muted/50">
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {attachment.is_external
            ? "External link"
            : formatFileSize(attachment.file_size)}
          {" • "}
          {new Date(attachment.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            {attachment.is_external ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(attachment.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown size";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} bytes`;
}
