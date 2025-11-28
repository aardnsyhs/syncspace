import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, BookTemplate } from "lucide-react";
import { PublicSharingSettings } from "./PublicSharingSettings";
import { SaveBoardAsTemplateDialog } from "./SaveBoardAsTemplateDialog";
import { Button } from "@/components/ui/button";
import { usePublicSharing } from "../hooks/usePublicSharing";
import { useBoardTemplates } from "../hooks/useBoardTemplates";

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
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sharing" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Sharing
              </TabsTrigger>
              <TabsTrigger value="template" className="flex items-center gap-1">
                <BookTemplate className="h-4 w-4" />
                Template
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
          </Tabs>
        </DialogContent>
      </Dialog>

      <SaveBoardAsTemplateDialog
        boardName={boardName}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSave={handleSaveAsTemplate}
      />
    </>
  );
}
