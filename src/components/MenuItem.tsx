import { MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ComMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: "4px",
  "&:hover": {backgroundColor: "rgba(0, 127, 255, 0.04)"},
  "&.Mui-selected": {backgroundColor: "rgba(0, 127, 255, 0.12)", color: theme.palette.primary.main},
  "& .MuiTouchRipple-root .MuiTouchRipple-ripple": {color: "rgba(0, 127, 255, 0.3)"}
}));
