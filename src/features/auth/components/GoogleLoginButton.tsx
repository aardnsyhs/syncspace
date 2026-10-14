import { Button } from "@/components/ui/button";
import { useAuth } from "../store/AuthContext";

export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Sign in with Google"
      className="mx-auto flex h-11 w-[198px] max-w-full rounded-[4px] bg-transparent p-0 hover:bg-transparent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#1f1f1f] dark:hover:bg-transparent dark:focus-visible:outline-[#e3e3e3]"
      onClick={loginWithGoogle}
    >
      <img
        src="/google-sign-in.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        width={180}
        height={40}
        className="pointer-events-none block h-auto w-full"
      />
    </Button>
  );
}
