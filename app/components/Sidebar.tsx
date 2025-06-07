import { Link, useLocation } from "react-router";

import {
  Box,
  List,
  Divider,
  ListItem,
  Typography,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
} from "@mui/joy";

import logo from "../assets/img/ksa_petegem_logo.png";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import RamenDiningRoundedIcon from "@mui/icons-material/RamenDiningRounded";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import InsertChartOutlinedOutlinedIcon from "@mui/icons-material/InsertChartOutlinedOutlined";
import InsertChartRoundedIcon from "@mui/icons-material/InsertChartRounded";

const Sidebar = ({ onNavigate = () => {} }) => {
  const location = useLocation();

  const menuItems = [
    { text: "Home", fillIcon: <DashboardRoundedIcon />, icon: <DashboardOutlinedIcon />, path: "/" },
    { text: "Leiding", fillIcon: <EventSeatRoundedIcon />, icon: <EventSeatOutlinedIcon />, path: "/leiding" },
    { text: "Groepen", fillIcon: <RamenDiningRoundedIcon />, icon: <RamenDiningOutlinedIcon />, path: "/groepen" },
    { text: "Werkgroepen", fillIcon: <ReceiptRoundedIcon />, icon: <ReceiptOutlinedIcon />, path: "/werkgroepen" },
    { text: "Posts", fillIcon: <InsertChartRoundedIcon />, icon: <InsertChartOutlinedOutlinedIcon />, path: "/posts" },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      bgcolor: "#fff"
    }}>
      {/* Top Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img
            src={logo}
            alt="KSA Petegem Logo"
            style={{ width: "80%", maxWidth: 160, height: "auto", objectFit: "contain" }}
          />
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List sx={{ "--ListItemDecorator-size": "32px", gap: 2 }}>
          {menuItems.map(({ text, fillIcon, icon, path }) => {
            const selected = location.pathname === path;
            return (
              <ListItem key={text} sx={{ p: 0 }}>
                <ListItemButton
                  component={Link}
                  to={path}
                  onClick={onNavigate}
                  selected={selected}
                  sx={{
                    borderRadius: "md",
                    px: 2,
                    py: 1,
                    gap: 1.5,
                    fontSize: "md",
                    fontWeight: selected ? "md" : "normal",
                    color: selected ? "primary.plainColor" : "text.primary",
                    bgcolor: selected ? "primary.softActiveBg" : "transparent",
                    "&:hover": {
                      bgcolor: "primary.softHoverBg",
                    },
                  }}
                >
                  <ListItemDecorator sx={{ color: selected ? "primary.plainColor" : "inherit" }}>
                    {selected ? fillIcon : icon}
                  </ListItemDecorator>
                  <ListItemContent>{text}</ListItemContent>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2, textAlign: "center", borderTop: "1px solid #eee" }}>
        <Typography level="body-xs" color="neutral">
          Gemaakt met 💙 door Arno
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;