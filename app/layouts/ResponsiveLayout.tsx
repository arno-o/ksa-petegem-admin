import { Outlet } from "react-router";
import { Box, Drawer, Sheet, IconButton, Typography } from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

export default function ResponsiveLayout() {
  const [open, setOpen] = useState(false);
  const SIDEBAR_WIDTH = 250;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1F5FB" }}>
      {/* Mobile Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        variant="plain"
        anchor="left"
        sx={{ display: { xs: "block", sm: "none" }, zIndex: 1200 }}
        slotProps={{
          content: {
            sx: {
              width: SIDEBAR_WIDTH,
              height: "100vh",
              boxShadow: "lg",
              borderRight: "1px solid #ccc",
              backgroundColor: "#fff",
            },
          },
        }}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </Drawer>

      {/* Permanent sidebar on desktop */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: "1px solid #ccc",
          backgroundColor: "#fff",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { sm: `${SIDEBAR_WIDTH}px` }, // Push content to the right of fixed sidebar
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile top bar */}
        <Sheet
          variant="soft"
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            px: 2,
            py: 1.5,
            gap: 1,
            boxShadow: "sm",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "background.surface",
          }}
        >
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography level="h4">KSA Petegem</Typography>
        </Sheet>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}