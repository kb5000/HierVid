import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { NumberInput } from "../../../components/NumberInput";
import {
  imgCompSettingPatterns,
  imgCompSettingPatternsSelected,
} from "../../../AssetWrap";

const groupedPattern = new Map([
  [2, [0, 3, 4, 5]],
  [3, [1, 2, 6, 7, 8, 9]],
]);

export const ComparisonDialog = (props: any) => {
  const theme = useTheme();
  const [slots, setNum] = useState(2);
  const [selectedPattern, setSelectedPattern] = useState(0);

  return (
    <>
      <Box p={2} sx={{ overflow: "hidden" }}>
        <Stack direction="row-reverse">
          <IconButton size="small" onClick={props.onButtonClick}>
            <Close color="error" />
          </IconButton>
        </Stack>
        <Stack direction="row" mt={1} px={1}>
          <Box flexGrow={1} mr={2}>
            <Typography variant="h4">模板1</Typography>
            <Typography
              sx={{
                mt: 1,
                wordWrap: "break-word",
                whiteSpace: "pre-line",
                fontSize: theme.typography.body2.fontSize,
                color: theme.palette.text.secondary,
              }}
            >
              {
                "混剪-站定对比-细节对比\n混剪-站定对比-细节对比混剪-站定对比-细节对比"
              }
            </Typography>
            <Box my={3} mr={1}>
              <Stack direction="row">
                <Typography>对比数量</Typography>
                <Box flexGrow={1} />
                <NumberInput
                  num={slots}
                  onChange={(num) => {
                    setNum(Math.min(3, Math.max(2, num)));
                    setSelectedPattern(0);
                  }}
                />
              </Stack>
              <Stack direction="row" mt={2}>
                <Typography mt={1}>边框</Typography>
                <Box flexGrow={1} />
                <Switch />
              </Stack>
            </Box>
            <Stack direction="row" mt={4}>
              <Button
                variant="contained"
                color="success"
                sx={{ px: "45px" }}
                onClick={props.onSuccessClick}
              >
                确 定
              </Button>
              <Box flexGrow={1} />
              <Button
                variant="contained"
                color="error"
                disabled
                sx={{ px: "45px" }}
              >
                重 置
              </Button>
            </Stack>
          </Box>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              width: "480px",
              minWidth: "480px",
              height: "270px",
              borderRadius: "10px",
              filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25))",
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={process.env.PUBLIC_URL + "/img/Group 38.png"}
              alt={"模板1"}
              sx={{
                position: "relative",
                left: "-8px",
                top: "-4px",
              }}
            />
          </Paper>
        </Stack>
      </Box>
      <Box
        sx={{
          mt: 1,
          flexGrow: 1,
          background: theme.palette.common.white,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography fontWeight="500" mx={3} my="12px">
          视频布局
        </Typography>
        <Box sx={{ position: "relative", width: "100%", flexGrow: 1 }}>
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "scroll",
            }}
          >
            <Stack direction="row" spacing={3} mx={3}>
              {groupedPattern.get(slots)?.map((x, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={
                    idx === selectedPattern
                      ? imgCompSettingPatternsSelected[x]
                      : imgCompSettingPatterns[x]
                  }
                  alt={"" + idx}
                  draggable={false}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setSelectedPattern(idx)}
                />
              ))}
              <Box sx={{ position: "relative", minWidth: "1px" }} />
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};
