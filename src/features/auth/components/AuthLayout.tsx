import { type ReactNode } from "react";
import { Layers } from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Layers className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">
              {import.meta.env.VITE_APP_NAME ?? "SaaS Boilerplate"}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Collaborate in real-time.
            <br />
            Ship faster together.
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            The modern kanban board for teams who want to move fast. Organize
            tasks, track progress, and stay in sync — all in one place.
          </p>
        </div>

        <div className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()}{" "}
          {import.meta.env.VITE_APP_NAME ?? "SaaS Boilerplate"}. All rights
          reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">
              {import.meta.env.VITE_APP_NAME ?? "SaaS Boilerplate"}
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
