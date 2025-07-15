import type { Group } from "~/types";
import { updateGroup } from "~/utils/data";
import { useState, useEffect } from "react";

import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
// Card and CardContent are no longer needed for a table-like structure
// import { Card, CardContent } from "~/components/ui/card";
import { PencilIcon } from "lucide-react";
import { cn } from "~/lib/utils"; // Assuming you have a utility for class concatenation (e.g., clsx or tailwind-merge)

interface GroupCardProps {
  group: Group;
  onGroupUpdate: (updatedGroup: Group) => void;
  onEdit?: (group: Group) => void;
}

// Define the color map within the component or ensure it's imported
const COLOR_MAP: Record<string, string> = {
    yellow: "bg-yellow-500 dark:bg-yellow-400",
    blue: "bg-blue-500 dark:bg-blue-400",
    green: "bg-green-500 dark:bg-green-400",
    purple: "bg-purple-500 dark:bg-purple-400",
    red: "bg-red-500 dark:bg-red-400",
    orange: "bg-orange-500 dark:bg-orange-400",
    lime: "bg-lime-500 dark:bg-lime-400",
    rose: "bg-rose-500 dark:bg-rose-400",
};

const GroupCard = ({ group, onGroupUpdate, onEdit }: GroupCardProps) => {
  const [isActive, setIsActive] = useState(group.active);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsActive(group.active);
  }, [group.active]);

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    setIsUpdating(true);
    try {
      await updateGroup(group.id, { active: checked });
      onGroupUpdate({ ...group, active: checked });
    } catch (err) {
      console.error("Failed to update group:", err);
      // Revert state if update fails
      setIsActive(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const colorClass = COLOR_MAP[group.color] || "bg-gray-200 dark:bg-gray-700"; 

  return (
    <div
      className={cn(
        "relative flex items-center py-3 px-4 border-b border-input last:border-b-0",
        "bg-background hover:bg-muted/50 transition-colors duration-200"
      )}
    >
      {/* Color Indicator - Left Border or Stripe */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", colorClass)} />

      {/* Main Content Area - Using CSS Grid for column alignment */}
      <div className="grid grid-cols-[1.5fr_2.1fr_1fr_0.8fr] items-center gap-4 w-full pl-2"> {/* Adjusted column widths */}
        {/* Group Name (Column 1) */}
        <div className="flex-1 min-w-[100px] items-center">
          <h3 className="text-base font-semibold truncate" title={group.naam}>{group.naam}</h3>
        </div>

        {/* Description (Column 2) */}
        <div className="flex-1 text-sm text-muted-foreground truncate" title={group.omschrijving}>
          {group.omschrijving || "-"} {/* Display "-" if no description */}
        </div>

        {/* Active Switch (Column 3) */}
        <div className="flex items-center gap-2 justify-center min-w-[80px]"> {/* Center align status */}
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
          <span className="text-sm text-muted-foreground hidden sm:inline"> {/* Hide text on very small screens if needed */}
            {isUpdating ? "Opslaan..." : isActive ? "Actief" : "Inactief"}
          </span>
        </div>

        {/* Edit Button (Column 4) */}
        <div className="flex justify-end items-center min-w-[80px]"> {/* Right align actions */}
          {onEdit && (
            <Button
              variant="ghost" // Use ghost for a cleaner look in a table row
              size="sm"
              onClick={() => onEdit(group)}
              disabled={isUpdating}
              className="ml-auto" // Pushes button to the right
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Bewerken</span> {/* Screen reader only text for icon-only button */}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;