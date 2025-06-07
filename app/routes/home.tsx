import { useEffect, useState } from "react";
import { fetchLeiding } from "../utils/data";
import {
  Box,
  Typography,
  Table,
  Sheet,
  Chip,
  IconButton,
} from "@mui/joy";
import type { Leiding } from "../types";
import EditIcon from "@mui/icons-material/Edit";
import EditLeidingDialog from "../components/EditLeidingDialog";

export default function Home() {
  const [leiding, setLeiding] = useState<Leiding[]>([]);
  const [selected, setSelected] = useState<Leiding | null>(null);

  useEffect(() => {
    fetchLeiding().then(setLeiding).catch(console.error);
  }, []);

  const handleUpdate = (updated: Leiding) => {
    setLeiding((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  return (
    <Box>
      <Typography level="h2" sx={{ mb: 2 }}>Leiding</Typography>

      <Sheet variant="outlined" sx={{ borderRadius: "sm", p: 2, overflow: "auto" }}>
        <Table borderAxis="xBetween" size="sm" stickyHeader sx={{ minWidth: 1000 }}>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Studies</th>
              <th>Werk</th>
              <th>KSA Sinds</th>
              <th>Hoofdleiding</th>
              <th>Geboortedatum</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {leiding.map((persoon) => (
              <tr key={persoon.id}>
                <td>{persoon.voornaam} {persoon.familienaam}</td>
                <td>{persoon.studies || "-"}</td>
                <td>{persoon.werk || "-"}</td>
                <td>{persoon.leiding_sinds ? new Date(persoon.leiding_sinds).toLocaleDateString() : "-"}</td>
                <td>
                  <Chip
                    size="sm"
                    variant={persoon.hoofdleiding ? "soft" : "outlined"}
                    color={persoon.hoofdleiding ? "success" : "neutral"}
                  >
                    {persoon.hoofdleiding ? "Ja" : "Nee"}
                  </Chip>
                </td>
                <td>{persoon.geboortedatum ? new Date(persoon.geboortedatum).toLocaleDateString() : "-"}</td>
                <td>
                  <IconButton size="sm" variant="plain" onClick={() => setSelected(persoon)}>
                    <EditIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      <EditLeidingDialog
        open={!!selected}
        persoon={selected}
        onClose={() => setSelected(null)}
        onUpdated={handleUpdate}
      />
    </Box>
  );
}
