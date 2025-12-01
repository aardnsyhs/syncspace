import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";

import { AuthLayout } from "../components/AuthLayout";
import { resetPassword } from "../api/authApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid password reset link");
      navigate("/login");
      return;
    }

    setValue("email", email);
    setFocus("password");
  }, [token, email, navigate, setValue, setFocus]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid password reset link");
      return;
    }

    try {
      const response = await resetPassword({
        ...data,
        token,
      });
      toast.success(response.message || "Password reset successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      const error = err as Error & {
        errors?: Record<string, string[]>;
        status?: number;
      };

      if (error.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (
            field === "email" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            setError(field, { message: messages[0] });
          }
        });
      } else {
        toast.error(
          error.message ||
            "Failed to reset password. The link may have expired."
        );
      }
    }
  };

  if (!token || !email) {
    return null;
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 px-0 lg:px-6 pt-0 lg:pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password_confirmation")}
                  aria-invalid={!!errors.password_confirmation}
                />
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-0 lg:px-6 pb-0 lg:pb-6 mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
