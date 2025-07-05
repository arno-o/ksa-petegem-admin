import type { Group } from "~/types";
import { updateGroup } from "~/utils/data";
import { useState, useEffect } from "react";

import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { PencilIcon } from "lucide-react";

interface GroupCardProps {
  group: Group;
  onGroupUpdate: (updatedGroup: Group) => void;
  onEdit?: (group: Group) => void;
}

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
      setIsActive(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{group.naam}</h3>
            {group.omschrijving && (
              <p className="text-sm text-muted-foreground mt-1">
                {group.omschrijving}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
              />
              <span className="text-sm text-muted-foreground">
                {isUpdating ? "Opslaan..." : isActive ? "Actief" : "Inactief"}
              </span>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => onEdit(group)}
                disabled={isUpdating}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Bewerken
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;