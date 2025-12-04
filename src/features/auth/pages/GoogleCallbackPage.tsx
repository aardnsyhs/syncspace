import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { toast } from "sonner";

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (hasProcessed.current) return;
    hasProcessed.current = true;

    if (error) {
      toast.error("Google login was cancelled");
      navigate("/login", { replace: true });
      return;
    }

    if (!code) {
      toast.error("Invalid callback");
      navigate("/login", { replace: true });
      return;
    }

    handleGoogleCallback(code)
      .then(() => {
        toast.success("Welcome!");
        navigate("/app", { replace: true });
      })
      .catch((err: Error & { data?: { message?: string } }) => {
        const message =
          err.data?.message || err.message || "Failed to sign in with Google";
        toast.error(message);
        navigate("/login", { replace: true });
      });
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing in with Google...</p>
      </div>
    </div>
  );
}
