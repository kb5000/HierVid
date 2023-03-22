import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { useImmer } from "use-immer";
import { NumberInput } from "../../../components/NumberInput";

export const CyclePreview = (props: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCanPlay = () => {
    videoRef.current?.play();
  };

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        alignItems: "center",
        p: 4,
      }}
      spacing={2}
    >
      <Box
        component="video"
        ref={videoRef}
        src={process.env.PUBLIC_URL + `/video/Cycle.mp4`}
        onCanPlay={handleCanPlay}
        loop={true}
        sx={{
          width: "680px",
        }}
      />
    </Stack>
  );
};
