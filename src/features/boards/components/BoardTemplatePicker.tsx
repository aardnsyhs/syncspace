import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layout,
  Globe,
  Users,
  ChevronRight,
  Columns,
  Check,
} from "lucide-react";
import type { BoardTemplate } from "../hooks/useBoardTemplates";

const BOARD_COLORS = [
  "#6366f1", 
  "#8b5cf6", 
  "#ec4899", 
  "#ef4444", 
  "#f97316", 
  "#eab308", 
  "#22c55e", 
  "#14b8a6", 
  "#06b6d4", 
  "#3b82f6", 
  "#64748b", 
  "#78716c", 
];

interface Props {
  templates: BoardTemplate[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    templateId: number,
    name: string,
    description?: string,
    color?: string
  ) => Promise<void>;
  onCreateBlank: (
    name: string,
    description?: string,
    color?: string
  ) => Promise<void>;
}

export function BoardTemplatePicker({
  templates,
  isLoading,
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateBlank,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<BoardTemplate | null>(null);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const globalTemplates = templates.filter((t) => t.visibility === "global");
  const teamTemplates = templates.filter((t) => t.visibility === "team");

  const handleCreate = async () => {
    if (!boardName.trim()) return;

    setIsCreating(true);
    try {
      if (selectedTemplate) {
        await onSelectTemplate(
          selectedTemplate.id,
          boardName.trim(),
          boardDescription.trim() || undefined,
          boardColor
        );
      } else {
        await onCreateBlank(
          boardName.trim(),
          boardDescription.trim() || undefined,
          boardColor
        );
      }
      
      setSelectedTemplate(null);
      setBoardName("");
      setBoardDescription("");
      setBoardColor(BOARD_COLORS[0]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setBoardName("");
    setBoardDescription("");
    setBoardColor(BOARD_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="templates"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Start from Template</TabsTrigger>
            <TabsTrigger value="blank">Blank Board</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 mt-4">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {}
                  {globalTemplates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Global Templates
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {globalTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            isSelected={selectedTemplate?.id === template.id}
                            onSelect={() => setSelectedTemplate(template)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {}
                  {teamTemplates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Team Templates
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {teamTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            isSelected={selectedTemplate?.id === template.id}
                            onSelect={() => setSelectedTemplate(template)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {templates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates available
                    </div>
                  )}
                </div>
              )}

              {}
              {selectedTemplate && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                  {selectedTemplate.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedTemplate.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Columns className="h-4 w-4" />
                    {selectedTemplate.column_count} columns
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="blank" className="mt-4">
            <div className="text-center py-8">
              <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Start with a blank board with default columns (To Do, In
                Progress, Review, Done)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {}
        <div className="space-y-3 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="board-desc">Description (optional)</Label>
            <Input
              id="board-desc"
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div className="space-y-2">
            <Label>Board Color</Label>
            <div className="flex flex-wrap gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => setBoardColor(color)}
                >
                  {boardColor === color && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!boardName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: BoardTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h5 className="font-medium truncate">{template.name}</h5>
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {template.description}
            </p>
          )}
        </div>
        <ChevronRight
          className={`h-4 w-4 flex-shrink-0 transition-transform ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Columns className="h-3 w-3" />
        {template.column_count} columns
      </div>
    </button>
  );
}
