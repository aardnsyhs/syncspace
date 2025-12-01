import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  PanelsTopLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTeam } from "@/features/team";

interface Board {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  cards_count: number;
  members_count: number;
  created_at: string;
}

export function BoardsListPage() {
  const navigate = useNavigate();
  const { selectedTeam, refreshTeams } = useTeam();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get boards from selected team
  const boards: Board[] = (selectedTeam?.boards as Board[]) || [];

  useEffect(() => {
    // Loading state depends on team context
    if (selectedTeam !== null) {
      setIsLoading(false);
    }
  }, [selectedTeam]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !selectedTeam) return;

    setIsSubmitting(true);
    try {
      const json = await api.post<{ data: { id: number } }>(
        `/api/teams/${selectedTeam.id}/boards`,
        {
          name: newBoardName,
          description: newBoardDescription || null,
        }
      );

      toast.success("Board created!");
      setIsCreateOpen(false);
      setNewBoardName("");
      setNewBoardDescription("");
      await refreshTeams();
      navigate(`/app/boards/${json.data.id}`);
    } catch {
      toast.error("Failed to create board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBoard = async () => {
    if (!editingBoard || !newBoardName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/api/boards/${editingBoard.id}`, {
        name: newBoardName,
        description: newBoardDescription || null,
      });

      toast.success("Board updated!");
      setIsEditOpen(false);
      setEditingBoard(null);
      setNewBoardName("");
      setNewBoardDescription("");
      await refreshTeams();
    } catch {
      toast.error("Failed to update board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      await api.delete(`/api/boards/${boardId}`);
      toast.success("Board deleted!");
      await refreshTeams();
    } catch {
      toast.error("Failed to delete board");
    }
  };

  const openEditDialog = (board: Board) => {
    setEditingBoard(board);
    setNewBoardName(board.name);
    setNewBoardDescription(board.description || "");
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Boards</h1>
          <p className="text-muted-foreground">
            Manage and organize your project boards
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedTeam}>
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Board Name</Label>
                <Input
                  id="name"
                  placeholder="Enter board name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter board description"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBoard}
                disabled={isSubmitting || !newBoardName.trim()}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Board
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {boards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PanelsTopLeft className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first board to start organizing your projects
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedTeam}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Board
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1"
                    onClick={() => navigate(`/app/boards/${board.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: board.color || "#3b82f6" }}
                      />
                      <CardTitle className="text-lg">{board.name}</CardTitle>
                    </div>
                    {board.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(board)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteBoard(board.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent onClick={() => navigate(`/app/boards/${board.id}`)}>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <PanelsTopLeft className="h-4 w-4" />
                    <span>{board.cards_count || 0} cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{board.members_count || 0} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Board Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter board description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditBoard}
              disabled={isSubmitting || !newBoardName.trim()}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
