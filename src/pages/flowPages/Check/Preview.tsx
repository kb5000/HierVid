import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { useImmer } from "use-immer";
import { NumberInput } from "../../../components/NumberInput";

export const CheckPreview = (props: any) => {
  const [data, chgData] = useImmer([2, 0]);
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
        src={process.env.PUBLIC_URL + `/video/Check_${data[0]}_${data[1]}.mp4`}
        onCanPlay={handleCanPlay}
        loop={true}
        sx={{
          width: "680px",
        }}
      />
      <Stack direction="row" spacing={2} alignItems="center">
          <Typography>分支数量</Typography>
          <NumberInput
            num={data[0]}
            onChange={(num) => {
              chgData(data => {
                data[0] = num
              });
            }}
          />
          <Box px={2}/>
          <Typography mt={1}>分支处样式</Typography>
          <Select
            size="small"
            value={data[1]}
            onChange={(e) => {
              chgData(data => {
                data[1] = Number(e.target.value)
              })
            }}
          >
            <MenuItem value={0}>默认</MenuItem>
            <MenuItem value={1}>分屏</MenuItem>
          </Select>
      </Stack>
    </Stack>
  );
};
