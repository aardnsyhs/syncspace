import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Copy,
  RefreshCw,
  AlertTriangle,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface PublicSharingResult {
  publicUrl: string | null;
}

interface Props {
  isPublic: boolean;
  publicUrl: string | null;
  onEnable: () => Promise<PublicSharingResult>;
  onDisable: () => Promise<void>;
  onRegenerate: () => Promise<PublicSharingResult>;
  isLoading: boolean;
}

export function PublicSharingSettings({
  isPublic,
  publicUrl,
  onEnable,
  onDisable,
  onRegenerate,
  isLoading,
}: Props) {
  const [showConfirmEnable, setShowConfirmEnable] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnable = async () => {
    try {
      await onEnable();
      toast.success("Public sharing enabled");
      setShowConfirmEnable(false);
    } catch {
      toast.error("Failed to enable public sharing");
    }
  };

  const handleDisable = async () => {
    try {
      await onDisable();
      toast.success("Public sharing disabled");
    } catch {
      toast.error("Failed to disable public sharing");
    }
  };

  const handleRegenerate = async () => {
    try {
      await onRegenerate();
      toast.success("Public link regenerated. Old links are now invalid.");
      setShowConfirmRegenerate(false);
    } catch {
      toast.error("Failed to regenerate link");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Public Sharing</h3>
      </div>

      {isPublic ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public link is active. Anyone with the link can view this board.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Public URL</Label>
            <div className="flex gap-2">
              <Input
                value={publicUrl || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={publicUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmRegenerate(true)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate Link
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisable}
              disabled={isLoading}
            >
              Disable Public Link
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enable public sharing to allow anyone with the link to view this
            board in read-only mode. They won't be able to make changes or see
            private information.
          </p>
          <Button
            onClick={() => setShowConfirmEnable(true)}
            disabled={isLoading}
          >
            <Globe className="h-4 w-4 mr-2" />
            Enable Public Link
          </Button>
        </div>
      )}

      {}
      <Dialog open={showConfirmEnable} onOpenChange={setShowConfirmEnable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Enable Public Sharing?
            </DialogTitle>
            <DialogDescription>
              This will create a public link that anyone can use to view this
              board. They will be able to see:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Board name and description</li>
                <li>All columns and cards</li>
                <li>Card labels and checklist progress</li>
                <li>Due dates</li>
              </ul>
              <p className="mt-2">
                They will NOT see: team members, assignees, comments, or
                activity history.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmEnable(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEnable} disabled={isLoading}>
              Enable Public Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog
        open={showConfirmRegenerate}
        onOpenChange={setShowConfirmRegenerate}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Regenerate Public Link?
            </DialogTitle>
            <DialogDescription>
              This will create a new public link and invalidate the old one.
              Anyone using the old link will no longer be able to access this
              board.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmRegenerate(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isLoading}>
              Regenerate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
