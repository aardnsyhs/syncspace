import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, BookTemplate, Trash2, Loader2 } from "lucide-react";
import { PublicSharingSettings } from "./PublicSharingSettings";
import { SaveBoardAsTemplateDialog } from "./SaveBoardAsTemplateDialog";
import { Button } from "@/components/ui/button";
import { usePublicSharing } from "../hooks/usePublicSharing";
import { useBoardTemplates } from "../hooks/useBoardTemplates";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  boardId: number;
  boardName: string;
  teamId: number;
  isPublic: boolean;
  publicUrl: string | null;
  token: string;
  canManage: boolean; // OWNER/ADMIN only
  isOpen: boolean;
  onClose: () => void;
  onBoardUpdated: () => void;
}

export function BoardSettingsPanel({
  boardId,
  boardName,
  teamId,
  isPublic,
  publicUrl,
  token,
  canManage,
  isOpen,
  onClose,
  onBoardUpdated,
}: Props) {
  const navigate = useNavigate();
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIsPublic, setCurrentIsPublic] = useState(isPublic);
  const [currentPublicUrl, setCurrentPublicUrl] = useState(publicUrl);

  const {
    enable,
    disable,
    regenerate,
    isLoading: publicLoading,
  } = usePublicSharing(token);
  const { saveAsTemplate } = useBoardTemplates(token);

  const handleEnablePublic = async () => {
    const result = await enable(boardId);
    setCurrentIsPublic(true);
    setCurrentPublicUrl(result.publicUrl);
    onBoardUpdated();
    return result;
  };

  const handleDisablePublic = async () => {
    await disable(boardId);
    setCurrentIsPublic(false);
    onBoardUpdated();
  };

  const handleRegeneratePublic = async () => {
    const result = await regenerate(boardId);
    setCurrentPublicUrl(result.publicUrl);
    onBoardUpdated();
    return result;
  };

  const handleSaveAsTemplate = async (name: string, description?: string) => {
    await saveAsTemplate(teamId, boardId, name, description);
  };

  const handleDeleteBoard = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/boards/${boardId}`);
      toast.success("Board deleted");
      // Dispatch custom event to refresh sidebar
      window.dispatchEvent(new CustomEvent("board-deleted"));
      onClose();
      navigate("/app/boards");
    } catch {
      toast.error("Failed to delete board");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Board Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="sharing" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sharing" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Sharing
              </TabsTrigger>
              <TabsTrigger value="template" className="flex items-center gap-1">
                <BookTemplate className="h-4 w-4" />
                Template
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center gap-1 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Danger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sharing" className="mt-4">
              <PublicSharingSettings
                isPublic={currentIsPublic}
                publicUrl={currentPublicUrl}
                onEnable={handleEnablePublic}
                onDisable={handleDisablePublic}
                onRegenerate={handleRegeneratePublic}
                isLoading={publicLoading}
              />
            </TabsContent>

            <TabsContent value="template" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookTemplate className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Save as Template</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this board's structure as a reusable template. Your team
                  can use it to quickly create new boards with the same columns
                  and WIP limits.
                </p>
                <Button onClick={() => setShowSaveTemplate(true)}>
                  <BookTemplate className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="danger" className="mt-4">
              <div className="space-y-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <h3 className="font-medium text-destructive">Delete Board</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Once you delete a board, there is no going back. This will
                  permanently delete the board and all its cards, columns, and
                  data.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Board
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <SaveBoardAsTemplateDialog
        boardName={boardName}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSave={handleSaveAsTemplate}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{boardName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board and all its cards, columns, checklists, and attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
