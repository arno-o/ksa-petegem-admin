import type { Group } from "~/types";
import { useState, useEffect } from "react";

import { Button } from "~/components/ui/button";
import { PencilIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface GroupCardProps {
  group: Group;
  onGroupUpdate: (updatedGroup: Group) => void;
  onEdit?: (group: Group) => void;
}

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-amber-500 dark:bg-amber-400",
  blue: "bg-blue-500 dark:bg-blue-400",
  green: "bg-emerald-500 dark:bg-emerald-400",
  purple: "bg-purple-500 dark:bg-purple-400",
  red: "bg-red-500 dark:bg-red-400",
  orange: "bg-orange-500 dark:bg-orange-400",
  lime: "bg-lime-500 dark:bg-lime-400",
  rose: "bg-rose-500 dark:bg-rose-400",
};

const GroupCard = ({ group, onEdit }: GroupCardProps) => {
  const [isActive, setIsActive] = useState(group.active);

  useEffect(() => {
    setIsActive(group.active);
  }, [group.active]);

  const colorClass = (group.color && COLOR_MAP[group.color]) || "bg-gray-200 dark:bg-gray-700";

  return (
    <div
      className={cn(
        "relative flex items-center py-3 px-4 border-b border-input last:border-b-0",
        "bg-background hover:bg-muted/50 transition-colors duration-200"
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", colorClass)} />

      <div className="grid grid-cols-[1.5fr_2.1fr_1fr_0.8fr] items-center gap-4 w-full pl-2"> {/* Adjusted column widths */}
        <div className="flex-1 min-w-[100px] items-center">
          <h3 className="text-base font-semibold truncate">{group.naam}</h3>
        </div>

        <div className="flex-1 text-sm text-muted-foreground truncate">
          {group.omschrijving || "-"}
        </div>

        <div className="flex items-center gap-2 justify-center min-w-[80px]">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              isActive ? "bg-green-500" : "bg-red-500"
            )}
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            {isActive ? "Actief" : "Inactief"}
          </span>
        </div>

        <div className="flex justify-end items-center min-w-[80px]">
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(group)}
              className="ml-auto"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Bewerken</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;