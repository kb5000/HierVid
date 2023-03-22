import { Box, IconButton, Stack, Typography, useTheme } from "@mui/material";

export const NumberInput = (props: {
  num: number;
  onChange: (num: number) => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "24px",
        background: theme.palette.common.white,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "4px",
      }}
    >
      <Stack direction="row">
        <Box px={1} sx={{cursor: "pointer", userSelect: "none"}} onClick={() => props.onChange(props.num - 1)}>
          <Typography fontFamily="monospace" position="relative" top="-1px">-</Typography>
        </Box>
        <Typography>{props.num}</Typography>
        <Box px={1} sx={{cursor: "pointer", userSelect: "none"}} onClick={() => props.onChange(props.num + 1)}>
          <Typography fontFamily="monospace" position="relative" top="-1.5px">+</Typography>
        </Box>
      </Stack>
    </Box>
  );
};
