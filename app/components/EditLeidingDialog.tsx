import {
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  Box,
} from "@mui/joy";

import { Dialog } from "@mui/material";
import type { Leiding } from "../types";
import { updateLeiding } from "../utils/data";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  persoon: Leiding | null;
  onUpdated: (updated: Leiding) => void;
}

export default function EditLeidingDialog({ open, onClose, persoon, onUpdated }: Props) {
  const [editing, setEditing] = useState<Leiding | null>(persoon);

  useEffect(() => {
    setEditing(persoon);
  }, [persoon]);

  const handleSave = async () => {
    if (!editing) return;
    await updateLeiding(editing.id, {
      voornaam: editing.voornaam,
      familienaam: editing.familienaam,
      werk: editing.werk,
      hoofdleiding: editing.hoofdleiding,
    });
    onUpdated(editing);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>Leiding Bewerken</DialogTitle>
      <DialogContent>
        {editing && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl>
              <FormLabel>Voornaam</FormLabel>
              <Input
                value={editing.voornaam}
                onChange={(e) =>
                  setEditing({ ...editing, voornaam: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Familienaam</FormLabel>
              <Input
                value={editing.familienaam}
                onChange={(e) =>
                  setEditing({ ...editing, familienaam: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Werk</FormLabel>
              <Input
                value={editing.werk ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, werk: e.target.value })
                }
              />
            </FormControl>

            <FormControl orientation="horizontal">
              <FormLabel>Hoofdleiding</FormLabel>
              <Switch
                checked={editing.hoofdleiding}
                onChange={(e) =>
                  setEditing({ ...editing, hoofdleiding: e.target.checked })
                }
              />
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="plain" onClick={onClose}>Annuleer</Button>
        <Button onClick={handleSave} color="primary">Opslaan</Button>
      </DialogActions>
    </Dialog>
  );
}