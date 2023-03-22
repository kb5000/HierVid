import {
  ArrowBack,
  ArrowForward,
  ArrowLeft,
  Edit,
  EditOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Input,
  Paper,
  setRef,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AspectRatio } from "../../../components/AspectRatio";
import addButtons from "../../../assets/img/addButton.svg";
import { Else, If } from "../../../components/Vue";
import { Uploader } from "../../../components/Uploader";
import React from "react";
import {
  getVideoCover,
  getWebDavInstance,
  URIBase,
} from "../../../tools/Backend";
import { clearModel, Layout, PlayModel } from "../../../schema/PlayModel";
import { ModelEditContext } from "../Detailed";
import { CycleConfig, generateCycleConfig, initConfig } from "./Config";
import { useImmer } from "use-immer";
import { ResizableBox } from "../../../components/ResizableBox";

export const CycleEdit = (props: any) => {
  const theme = useTheme();
  const [model, chgModel] = useContext(ModelEditContext)!;
  const [config, chgConfig] = useImmer<CycleConfig>(
    model.templateData.template === "Cycle"
      ? model.templateData.templateConfig as CycleConfig
      : initConfig()
  );
  const [video, setVideo] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 200, height: 200 });
  const [textBuf, setTextBuf] = useState("")

  const resetSize = () => {
    if (boxRef.current) {
      setBoxSize({
        width: boxRef.current.clientWidth,
        height: boxRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    resetSize();
    window.addEventListener("resize", resetSize);

    return () => {
      window.removeEventListener("resize", resetSize);
    };
  }, []);

  useEffect(() => {
    chgModel(model => {
      model.templateData.template = "Cycle"
      model.templateData.templateConfig = config
    })
  }, [config, chgModel])

  useEffect(() => {
    setTextBuf(config.videoText[video]?.text ?? "")
  }, [config, video])

  const handleLast = () => {
    props.handleLast();
  };

  const handleNext = () => {
    chgModel(draft => {
      clearModel(draft)
      generateCycleConfig(draft, config, true, null)
    });
    props.handleNext();
  };

  const handleSwitchVideo = (direction: -1 | 1) => {
    setVideo((video) => {
      const res = (video + direction + config.videoNumber) % config.videoNumber;
      return res;
    });
  };

  const handleTextChanged = (e: any, idx: number) => {
    const defVal = {
      top: 80,
      left: 10,
      width: 80,
      height: 10,
    };
    chgConfig((conf) => {
      conf.videoText[idx] = {
        ...(conf.videoText[idx] ?? defVal),
        text: e.target.value,
      };
    });
  };

  const handleStateChanged = (
    idx: number,
    state: {
      top: number;
      left: number;
      width: number;
      height: number;
    }
  ) => {
    chgConfig((conf) => {
      const last = conf.videoText[idx]?.text ?? "";
      conf.videoText[idx] = {
        top: state.top * 100,
        left: state.left * 100,
        width: state.width * 100,
        height: state.height * 100,
        text: last,
      };
    });
  };

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          height: "100%",
          width: "100%",
          pt: 3,
          display: "flex",
          flexDirection: "column",
          background: theme.palette.grey[100],
        }}
      >
        <Stack direction="row" px={7}>
          <Button
            variant="text"
            size="small"
            sx={{
              height: "32px",
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0)",
              },
            }}
            onClick={handleLast}
          >
            <ArrowBack sx={{ fontSize: "16px", mr: 1 }} />
            Back
          </Button>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            size="small"
            sx={{ height: "32px" }}
            onClick={handleNext}
          >
            Preview
          </Button>
        </Stack>
        <Stack sx={{ alignItems: "center", flexGrow: 1 }}>
          <Typography fontWeight="500" mt={1}>
            {"Step 1 / 1：Set the caption of the text button"}
          </Typography>
          <Box
            sx={{
              my: 4,
              position: "relative",
              flexGrow: 1,
              width: "100%",
            }}
          >
            <AspectRatio aspectratio="16/9">
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.common.white,
                }}
                ref={boxRef}
              >
                <Box
                  component="video"
                  src={config.videos[video]?.url}
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                ></Box>
                <ResizableBox
                  key={JSON.stringify([config.videoText[video], boxSize])}
                  state={{
                    width: (config.videoText[video]?.width ?? 80) / 100,
                    height: (config.videoText[video]?.height ?? 10) / 100,
                    top: (config.videoText[video]?.top ?? 80) / 100,
                    left: (config.videoText[video]?.left ?? 10) / 100,
                  }}
                  bound={boxSize}
                  onStateChanged={(x) => handleStateChanged(video, x)}
                >
                  <Input
                    sx={{
                      position: "relative",
                      fontSize: "24pt",
                      top: "8px",
                      height: "80%",
                      width: "100%",
                      textAlign: "center",
                    }}
                    value={textBuf}
                    onChange={(e) => setTextBuf(e.target.value)}
                    onBlur={(e) => handleTextChanged(e, video)}
                  />
                </ResizableBox>
                <Box
                  sx={{
                    position: "absolute",
                    color: theme.palette.primary.main,
                    padding: "3px 3px",
                    fontSize: "0.8125rem",
                    left: "16px",
                    top: "16px",
                    background: theme.palette.common.white,
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: "4px",
                    border: "none",
                    userSelect: "none",
                  }}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleSwitchVideo(-1)}
                  >
                    <ArrowBack sx={{ fontSize: "18px" }} />
                  </IconButton>
                  <Box
                    component="span"
                    sx={{ position: "relative", top: "2px" }}
                  >
                    Video {video + 1}
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleSwitchVideo(1)}
                  >
                    <ArrowForward sx={{ fontSize: "18px" }} />
                  </IconButton>
                </Box>
              </Box>
            </AspectRatio>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
