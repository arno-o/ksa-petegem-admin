import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="flex items-center justify-center h-[80svh] bg-background text-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}