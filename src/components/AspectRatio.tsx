import { Box } from "@mui/material";

export const AspectRatio = (props: any) => (
  <Box {...{...props, children: undefined}}>
    <Box sx={{ position: "absolute", height: "100%", width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          maxHeight: "100%",
          maxWidth: "100%",
          aspectRatio: props.aspectratio,
          margin: "0 auto",
        }}
      >
        {props.children}
      </Box>
    </Box>
  </Box>
);
