import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BoardTemplatePicker } from "./BoardTemplatePicker";
import { useBoardTemplates } from "../hooks/useBoardTemplates";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  teamId: number;
  token: string;
  onBoardCreated: (boardId: number) => void;
}

export function CreateBoardDialog({ teamId, token, onBoardCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { templates, isLoading, createBoardFromTemplate } =
    useBoardTemplates(token);

  const handleSelectTemplate = async (
    templateId: number,
    name: string,
    description?: string
  ) => {
    try {
      const board = await createBoardFromTemplate(
        teamId,
        templateId,
        name,
        description
      );
      toast.success("Board created from template");
      onBoardCreated(board.id);
    } catch {
      toast.error("Failed to create board");
      throw new Error("Failed");
    }
  };

  const handleCreateBlank = async (name: string, description?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/teams/${teamId}/boards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) throw new Error("Failed to create board");

      const json = await res.json();
      toast.success("Board created");
      onBoardCreated(json.data.id);
    } catch {
      toast.error("Failed to create board");
      throw new Error("Failed");
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Board
      </Button>

      <BoardTemplatePicker
        templates={templates}
        isLoading={isLoading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateBlank={handleCreateBlank}
      />
    </>
  );
}
