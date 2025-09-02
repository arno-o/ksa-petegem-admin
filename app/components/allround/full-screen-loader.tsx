import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-background text-foreground z-50">
      <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    </div>
  );
}