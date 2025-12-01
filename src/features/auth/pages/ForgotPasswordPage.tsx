import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { AuthLayout } from "../components/AuthLayout";
import { forgotPassword } from "../api/authApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!isSuccess) {
      setFocus("email");
    }
  }, [setFocus, isSuccess]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success(response.message || "Password reset link sent!");
    } catch (err) {
      const error = err as Error & {
        errors?: Record<string, string[]>;
        status?: number;
      };

      if (error.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field === "email") {
            setError(field, { message: messages[0] });
          }
        });
      } else {
        toast.error(error.message || "Failed to send reset link");
      }
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <Card className="border-0 shadow-none lg:border lg:shadow-sm">
          <CardContent className="px-0 lg:px-6 pt-0 lg:pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to
                </p>
                <p className="font-medium">{submittedEmail}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. If you don't
                see the email, check your spam folder.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-0 lg:px-6 pb-0 lg:pb-6">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-sm text-primary hover:underline"
            >
              Try a different email
            </button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 px-0 lg:px-6 pt-0 lg:pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-0 lg:px-6 pb-0 lg:pb-6 mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
