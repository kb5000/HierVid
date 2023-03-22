import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { NumberInput } from "../../../components/NumberInput";
import {
  imgCompSettingPatterns,
  imgCompSettingPatternsSelected,
} from "../../../AssetWrap";
import { useImmer } from "use-immer";
import { ModelEditContext } from "../Detailed";
import { CheckConfig, generateCheckConfig, initConfig } from "./Config";
import { Position } from "../../../tools/Interfaces";
import { useSnackbar } from "notistack";
import { getWebDavInstance, URIBase } from "../../../tools/Backend";
import { HorizontalScroller } from "../../../components/HorizontalScroller";
import { If } from "../../../components/Vue";

const groupedPattern = new Map([
  [2, [0, 3, 4]],
  [3, [6, 7, 8, 9]],
]);

const videoPosList: () => Record<string, Position[]> = () => ({
  "2_0": [
    {
      top: 0,
      left: 0,
      width: 50,
      height: 100,
    },
    {
      top: 0,
      left: 50,
      width: 50,
      height: 100,
    },
  ],
  "2_1": [
    {
      top: 0,
      left: 0,
      width: 30,
      height: 100,
    },
    {
      top: 0,
      left: 30,
      width: 70,
      height: 100,
    },
  ],
  "2_2": [
    {
      top: 0,
      left: 0,
      width: 100,
      height: 50,
    },
    {
      top: 50,
      left: 0,
      width: 100,
      height: 50,
    },
  ],
  "3_0": [
    {
      top: 0,
      left: 0,
      width: 33,
      height: 100,
    },
    {
      top: 0,
      left: 33,
      width: 34,
      height: 100,
    },
    {
      top: 0,
      left: 67,
      width: 33,
      height: 100,
    },
  ],
  "3_1": [
    {
      top: 0,
      left: 0,
      width: 33,
      height: 100,
    },
    {
      top: 0,
      left: 33,
      width: 67,
      height: 50,
    },
    {
      top: 50,
      left: 33,
      width: 67,
      height: 50,
    },
  ],
  "3_2": [
    {
      top: 0,
      left: 0,
      width: 67,
      height: 50,
    },
    {
      top: 50,
      left: 0,
      width: 67,
      height: 50,
    },
    {
      top: 0,
      left: 67,
      width: 33,
      height: 100,
    },
  ],
  "3_3": [
    {
      top: 0,
      left: 0,
      width: 33,
      height: 50,
    },
    {
      top: 50,
      left: 0,
      width: 33,
      height: 50,
    },
    {
      top: 0,
      left: 33,
      width: 67,
      height: 100,
    },
  ],
});
const textPosList: () => Record<string, Position[]> = () => ({
  "2": [
    {
      top: 80,
      left: 10,
      width: 35,
      height: 10,
    },
    {
      top: 80,
      left: 55,
      width: 35,
      height: 10,
    },
  ],
  "3": [
    {
      top: 80,
      left: 10,
      width: 20,
      height: 10,
    },
    {
      top: 80,
      left: 40,
      width: 20,
      height: 10,
    },
    {
      top: 80,
      left: 70,
      width: 20,
      height: 10,
    },
  ],
});

export const CheckDialog = (props: {data: {name?: string}, onSuccessClick: () => void, onButtonClick: () => void}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [changed, setChanged] = useState(false);
  const [model, chgModel] = useContext(ModelEditContext)!;
  const [unnamedConfig, chgUnnamedConfig] = useImmer<CheckConfig>(
    model.templateData.template === "Check"
      ? model.templateData.templateConfig as CheckConfig
      : initConfig()
  );
  const namedConfig = model.templateData.componentConfig[props.data.name ?? ""]
  const chgNamedConfig = (config: (draft: CheckConfig) => void) => {
    chgModel(draft => {
      config(draft.templateData.componentConfig[props.data.name!] as CheckConfig)
    })
  }
  const config = props.data.name ? namedConfig as CheckConfig : unnamedConfig
  const chgConfig = props.data.name ? chgNamedConfig : chgUnnamedConfig

  const handleSuccessClick = () => {
    chgModel((model) => {
      model.templateData.template = "Check";
      model.templateData.templateConfig = config;
    });
    props.onSuccessClick();
  };

  useEffect(() => {
    const textPos = textPosList()["" + config.branchNumber]
    chgConfig(config => {
      for (let i = 0; i < textPos.length; i++) {
        config.videoText["branch_" + i] = {
          ...textPos[i],
          text: config.videoText["branch_" + i]?.text ?? "",
        }
      }
    })
    if (config.style === 1) {
      const videoPos = videoPosList()[config.branchNumber + "_" + config.selectedPattern]
      chgConfig(config => {
        config.videoPos = videoPos;
      })
    }
  }, [config.branchNumber, config.selectedPattern, config.style]);

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
            <Typography variant="h4">{props.data.name ? "Comparing Module" : "Comparison Template"}</Typography>
            <Typography
              sx={{
                mt: 1,
                wordWrap: "break-word",
                whiteSpace: "pre-line",
                fontSize: theme.typography.body2.fontSize,
                color: theme.palette.text.secondary,
              }}
            >
              {props.data.name ? "" : "Shuttled Jump"}
            </Typography>
            <Box my={3} mr={1}>
              <Stack direction="row">
                <Typography>Branches</Typography>
                <Box flexGrow={1} />
                <NumberInput
                  num={config.branchNumber}
                  onChange={(num) => {
                    chgConfig((conf) => {
                      conf.branchNumber = Math.min(3, Math.max(2, num));
                      conf.selectedPattern = 0;
                      setChanged(true);
                    });
                  }}
                />
              </Stack>
              <Stack direction="row" mt={2}>
                <Typography mt={1}>Branch Style</Typography>
                <Box flexGrow={1} />
                <Select
                  size="small"
                  value={config.style}
                  onChange={(e) => {
                    chgConfig((conf) => {
                      conf.style = e.target.value as any;
                      setChanged(true);
                    });
                  }}
                >
                  <MenuItem value={0}>Default</MenuItem>
                  <MenuItem value={1}>Split Screen</MenuItem>
                </Select>
              </Stack>
            </Box>
            <Stack direction="row" mt={4}>
              <Button
                variant="contained"
                color="success"
                sx={{ px: "45px" }}
                onClick={handleSuccessClick}
              >
                Confirm
              </Button>
              <Box flexGrow={1} />
              <Button
                variant="outlined"
                color="error"
                sx={{ px: "45px" }}
                disabled={!changed}
                onClick={() => {
                  chgConfig(initConfig);
                  setChanged(false);
                }}
              >
                Reset
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
              src={process.env.PUBLIC_URL + "/img/模版3-详情_640.jpg"}
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
          Layout of branching video
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
              {groupedPattern.get(config.branchNumber)?.map((x, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={
                    idx === config.selectedPattern && config.style === 1
                      ? imgCompSettingPatternsSelected[x]
                      : imgCompSettingPatterns[x]
                  }
                  alt={"" + idx}
                  draggable={false}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() =>
                    chgConfig((conf) => {
                      conf.selectedPattern = idx;
                      if (config.style === 0) {
                        enqueueSnackbar("默认模式下无需选择布局", { variant: 'warning' })
                      } else {
                        setChanged(true);
                      }
                    })
                  }
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

export const CheckComponentSetting = (props: {name: string}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [model, chgModel] = useContext(ModelEditContext)!;
  const config = model.templateData.componentConfig[props.name] as CheckConfig
  const chgConfig = (config: (draft: CheckConfig) => void) => {
    chgModel(draft => {
      config(draft.templateData.componentConfig[props.name] as CheckConfig)
    })
  }
  const [videoSelection, setVideoSelection] = useState(config.style === 0 ? "branch" : "branch_1");
  const [uploadState, setUploadState] = useState<"noupload" | "uploading" | "uploaded">("noupload")

  useEffect(() => {
    setVideoSelection(config.style === 0 ? "branch" : "branch_1")
  }, [props.name])

  useEffect(() => {
    setUploadState("noupload")
  }, [videoSelection])

  useEffect(() => {
    const textPos = textPosList()["" + config.branchNumber]
    chgConfig(config => {
      for (let i = 0; i < textPos.length; i++) {
        config.videoText["branch_" + i] = {
          ...textPos[i],
          text: config.videoText["branch_" + i]?.text ?? "",
        }
      }
    })
    if (config.style === 1) {
      const videoPos = videoPosList()[config.branchNumber + "_" + config.selectedPattern]
      chgConfig(config => {
        config.videoPos = videoPos;
      })
    }
  }, [config.branchNumber, config.selectedPattern, config.style]);

  const handleFileUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    setUploadState('uploading')
    const file = e.target.files[0];
    const content = await file.arrayBuffer();
    await getWebDavInstance().uploadFile("/Videos/" + file.name, content);
    const url = URIBase + "/Videos/" + file.name;
    chgConfig(config => {
      config.videos[videoSelection] = url;
    })
    setUploadState('uploaded')
  }

  return (
    <>
      <Stack p={1} spacing={1}>
        <Typography fontWeight="bold">{config.prefix}</Typography>
        <Stack direction="row">
          <Typography>Branches</Typography>
          <Box flexGrow={1} />
          <NumberInput
            num={config.branchNumber}
            onChange={(num) => {
              chgConfig((conf) => {
                conf.branchNumber = Math.min(3, Math.max(2, num));
                conf.selectedPattern = 0;
              });
            }}
          />
        </Stack>
        <Stack direction="row">
          <Typography mt={1}>Branch Style</Typography>
          <Box flexGrow={1} />
          <Select
            size="small"
            value={config.style}
            onChange={(e) => {
              chgConfig((conf) => {
                conf.style = e.target.value as any;
              });
            }}
          >
            <MenuItem value={0}>Default</MenuItem>
            <MenuItem value={1}>Split Screen</MenuItem>
          </Select>
        </Stack>
        <Typography>Layout of branching video</Typography>
        <HorizontalScroller>
          <Stack direction="row" spacing={3} my={1}>
            {groupedPattern.get(config.branchNumber)?.map((x, idx) => (
              <Box
                key={idx}
                component="img"
                src={
                  idx === config.selectedPattern && config.style === 1
                    ? imgCompSettingPatternsSelected[x]
                    : imgCompSettingPatterns[x]
                }
                alt={"" + idx}
                draggable={false}
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() =>
                  chgConfig((conf) => {
                    conf.selectedPattern = idx;
                    if (config.style === 0) {
                      enqueueSnackbar("默认模式下无需选择布局", {
                        variant: "warning",
                      });
                    }
                  })
                }
              />
            ))}
            <Box sx={{ position: "relative", minWidth: "1px" }} />
          </Stack>
        </HorizontalScroller>
        <Typography>Upload video</Typography>
        <Select
          size="small"
          value={videoSelection}
          onChange={(e) => {
            setVideoSelection(e.target.value);
          }}
        >
          {config.style === 0 ? (
            <MenuItem value={"branch"} key="branch">
              Branching
            </MenuItem>
          ) : (
            Array.from(new Array(config.branchNumber)).map((k, idx) => (
              <MenuItem
                value={"branch_" + idx}
                key={"branch_" + idx}
              >
                Branch {idx + 1}
              </MenuItem>
            ))
          )}
          {Array.from(new Array(config.branchNumber)).map((k, idx) => (
            <MenuItem
              value={"content_" + idx}
              key={"content_" + idx}
            >
              Branch {idx + 1}
            </MenuItem>
          ))}
        </Select>
        <Box component="input" aria-label="uploader" type="file" onChange={handleFileUploaded} />
        <If v-if={uploadState !== "noupload"}>
          <Typography>{uploadState === "uploading" ? "上传中，请等待" : "上传成功"}</Typography>
        </If>
      </Stack>
    </>
  );
};
