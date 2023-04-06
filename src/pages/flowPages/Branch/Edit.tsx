import { ArrowBack, ArrowForward } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Input,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { AspectRatio } from "../../../components/AspectRatio";
import addButtons from "../../../assets/img/addButton.svg";
import { If } from "../../../components/Vue";
import { Uploader } from "../../../components/Uploader";
import React from "react";
import { getVideoCover, getWebDavInstance, URIBase } from "../../../tools/Backend";
import { clearModel, PlayModel } from "../../../schema/PlayModel";
import { ModelEditContext } from "../Detailed";
import { useImmer } from "use-immer";
import { BranchConfig, generateBranchConfig, initConfig } from "./Config";
import { addRelativeMark } from "../../../tools/Interfaces";
import { ResizableBox } from "../../../components/ResizableBox";

export const BranchEdit = (props: any) => {
  const theme = useTheme();
  const [page, setPage] = useState(props.firstPage === -1 ? 1 : 0);
  const [model, chgModel] = useContext(ModelEditContext)!;
  const [video, setVideo] = useState(0);
  const [config, chgConfig] = useImmer<BranchConfig>(
    model.templateData.template === "Branch"
      ? model.templateData.templateConfig as BranchConfig
      : initConfig()
  );
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 200, height: 200 });
  const [textBufs, chgTextBufs] = useImmer<Record<string, string>>({});

  const resetSize = () => {
    if (boxRef.current) {
      setBoxSize({
        width: boxRef.current.clientWidth,
        height: boxRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    chgModel((model) => {
      model.templateData.template = "Branch";
      model.templateData.templateConfig = config;
    });
  }, [config, chgModel]);

  useEffect(() => {
    resetSize();
    window.addEventListener("resize", resetSize);

    return () => {
      window.removeEventListener("resize", resetSize);
    };
  }, []);

  const handleSwitchVideo = (direction: -1 | 1) => {
    setVideo((video) => {
      const res =
        (video + direction + config.branchNumber) % config.branchNumber;
      return res;
    });
  };

  const handleTextChanged = (e: any, name: string) => {
    const defVal = {
      top: 80,
      left: 10,
      width: 80,
      height: 10,
    };
    chgConfig((conf) => {
      conf.videoText[name] = {
        ...(conf.videoText[name] ?? defVal),
        text: e.target.value,
      };
    });
    console.log("changed");
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
      const last = conf.videoText["branch_" + idx]?.text ?? "";
      conf.videoText["branch_" + idx] = {
        top: state.top * 100,
        left: state.left * 100,
        width: state.width * 100,
        height: state.height * 100,
        text: last,
      };
    });
  };

  const handleLast = () => {
    if (page === 0) {
      props.handleLast();
    } else {
      setPage((p: number) => p - 1);
    }
  };

  const handleNext = () => {
    if (page === 2) {
      chgModel(draft => {
        clearModel(draft)
        generateBranchConfig(draft, config, true, null, -1)
      });
      props.handleNext();
    } else {
      setPage((p: number) => p + 1);
    }
  };

  const handleFileUploaded = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (!e.target.files?.length) {
      return;
    }
    const file = e.target.files[0];
    const content = await file.arrayBuffer();
    await getWebDavInstance().uploadFile("/Videos/" + file.name, content);
    const turl = URL.createObjectURL(file);
    const url = URIBase + "/Videos/" + file.name;
    const cover = await getVideoCover(turl);
    chgConfig((config) => {
      config.videos[key] = url;
      config.videoLength[key] = cover.length;
    });
  };

  const VideoUploader = (props: { name: string }) => (
    <>
      {props.name in config.videos ? (
        <Box
          component="video"
          src={config.videos[props.name]}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Box component="img" src={addButtons} sx={{ width: "10%" }} />
        </Box>
      )}
      <Uploader onChange={(e) => handleFileUploaded(e, props.name)} />
    </>
  );

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
            {page === 2 ? "Preview" : "Next"}
          </Button>
        </Stack>
        <Stack sx={{ alignItems: "center", flexGrow: 1 }}>
          <Typography fontWeight="500" mt={1}>
            {
              [
                "Step 1 / 3：Upload the opening",
                "Step 2 / 3：Set the caption of the text button, and upload picture(s) or video(s)",
                "Step 3 / 3：Upload video of each branch",
              ][page]
            }
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
                <If v-if={page === 0}>
                  <VideoUploader name="start" />
                </If>
                <If v-if={page === 1 && config.style === 1}>
                  {config.videoPos.map((x, idx) => (
                    <Box
                      sx={{
                        ...addRelativeMark(x),
                        position: "absolute",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      key={idx}
                    >
                      <VideoUploader name={"branch_" + idx} />
                    </Box>
                  ))}
                </If>
                <If v-if={page === 1 && config.style === 0}>
                  <VideoUploader name={"branch"} />
                </If>
                <If v-if={page === 1}>
                  {Object.entries(config.videoText).map((x, idx) => {
                    if (x[0].startsWith("branch_")) {
                      const text = x[1];
                      return (
                        <ResizableBox
                          key={JSON.stringify([text, boxSize])}
                          state={{
                            width: (text.width ?? 80) / 100,
                            height: (text.height ?? 10) / 100,
                            top: (text.top ?? 80) / 100,
                            left: (text.left ?? 10) / 100,
                          }}
                          bound={boxSize}
                          onStateChanged={(x) => handleStateChanged(idx, x)}
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
                            value={textBufs[x[0]] ?? ""}
                            onChange={(e) =>
                              chgTextBufs((textBufs) => {
                                textBufs[x[0]] = e.target.value;
                              })
                            }
                            onBlur={(e) => handleTextChanged(e, x[0])}
                          />
                        </ResizableBox>
                      );
                    } else {
                      return null;
                    }
                  })}
                </If>
                <If v-if={page === 2}>
                  <VideoUploader name={"content_" + video} />
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
                      Branch {video + 1}
                    </Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleSwitchVideo(1)}
                    >
                      <ArrowForward sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Box>
                </If>
              </Box>
            </AspectRatio>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
