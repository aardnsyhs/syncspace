import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import { AuthLayout } from "../components/AuthLayout";
import { verifyOTP, resendOTP } from "../api/authApi";
import { useAuth } from "../store/AuthContext";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const { updateUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid verification link");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await verifyOTP({ email, otp });
      updateUser(response.data);
      toast.success(response.message || "Email verified successfully!");
      navigate("/app", { replace: true });
    } catch (err) {
      const error = err as Error & { message?: string };
      toast.error(error.message || "Invalid verification code");
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;

    setIsResending(true);

    try {
      const response = await resendOTP({ email });
      toast.success(response.message || "Verification code resent!");
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      const error = err as Error & { message?: string };
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email"
    >
      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-0 lg:px-6 pt-0 lg:pt-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to
              </p>
              <p className="font-medium">{email}</p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isSubmitting}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown}s
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-0 lg:px-6 pb-0 lg:pb-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
