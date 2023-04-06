import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { NumberInput } from "../../../components/NumberInput";
import { useImmer } from "use-immer";
import { ModelEditContext } from "../Detailed";
import {
  getVideoCover,
  getWebDavInstance,
  URIBase,
} from "../../../tools/Backend";
import addButtons from "../../../assets/img/addButton.svg";
import { Uploader } from "../../../components/Uploader";
import axios from "axios";
import { CycleConfig, generateCycleConfig, initConfig } from "./Config";
import { If } from "../../../components/Vue";

export const CycleDialog = (props: {
  data: { name?: string };
  onSuccessClick: () => void;
  onButtonClick: () => void;
}) => {
  const theme = useTheme();
  const [changed, setChanged] = useState(false);
  const [model, chgModel] = useContext(ModelEditContext)!;
  const [unnamedConfig, chgUnnamedConfig] = useImmer<CycleConfig>(
    model.templateData.template === "Cycle"
      ? (model.templateData.templateConfig as CycleConfig)
      : initConfig()
  );
  const namedConfig = model.templateData.componentConfig[props.data.name ?? ""];
  const chgNamedConfig = (config: (draft: CycleConfig) => void) => {
    chgModel((draft) => {
      config(
        draft.templateData.componentConfig[props.data.name!] as CycleConfig
      );
    });
  };
  const config = props.data.name ? (namedConfig as CycleConfig) : unnamedConfig;
  const chgConfig = props.data.name ? chgNamedConfig : chgUnnamedConfig;
  const coverMap = useRef(new Map());

  useEffect(() => {
    const promises = [];
    for (const i of config.videos) {
      if (i === null) continue;
      if (!coverMap.current.has(i.cover)) {
        promises.push(
          axios.get(i.cover).then((res) => {
            coverMap.current.set(i.cover, res.data);
          })
        );
      }
    }
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        chgConfig((conf) => {
          conf.videos = [...conf.videos];
        });
      });
    }
  }, [chgConfig, config.videos]);

  const handleSuccessClick = () => {
    chgModel((model) => {
      model.templateData.template = "Cycle";
      model.templateData.templateConfig = config;
    });
    props.onSuccessClick();
  };

  const handleFileUploaded = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (!e.target.files?.length) {
      return;
    }
    const file = e.target.files[0];
    const fileName = encodeURIComponent(file.name);
    const content = await file.arrayBuffer();
    await getWebDavInstance().uploadFile("/Videos/" + fileName, content);
    const turl = URL.createObjectURL(file);
    const url = URIBase + "/Videos/" + fileName;
    const {cover, length} = await getVideoCover(turl);
    await getWebDavInstance().uploadFile("/Images/" + fileName + ".txt", cover);
    const coverUrl = URIBase + "/Images/" + fileName + ".txt";
    coverMap.current.set(coverUrl, cover);
    chgConfig((conf) => {
      conf.videos[idx] = {
        cover: coverUrl,
        url,
        length,
      };
    });
    console.log(e, cover);
  };

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
            <Typography variant="h4">
              {props.data.name ? "Loop Module" : "Loop Template"}
            </Typography>
            <Typography
              sx={{
                mt: 1,
                wordWrap: "break-word",
                whiteSpace: "pre-line",
                fontSize: theme.typography.body2.fontSize,
                color: theme.palette.text.secondary,
              }}
            >
              {props.data.name ? "" : "Linear / Loop"}
            </Typography>
            <Box my={3} mr={1}>
              <Stack direction="row">
                <Typography>Video(s) in loop</Typography>
                <Box flexGrow={1} />
                <NumberInput
                  num={config.videoNumber}
                  onChange={(num) => {
                    chgConfig((conf) => {
                      conf.videoNumber = Math.max(1, num);
                      conf.videos = Array.from(new Array(conf.videoNumber)).map(
                        (_) => null
                      );
                      conf.videoText = Array.from(
                        new Array(conf.videoNumber)
                      ).map((_) => null);
                      setChanged(true);
                    });
                  }}
                />
              </Stack>
              <Stack direction="row" mt={2}>
                <Typography mt={1}>Auto Loop</Typography>
                <Box flexGrow={1} />
                <Switch
                  checked={config.autoCycle}
                  onChange={(e) => {
                    chgConfig((conf) => {
                      conf.autoCycle = e.target.checked;
                      setChanged(true);
                    });
                  }}
                />
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
                disabled={!changed}
                sx={{ px: "45px" }}
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
              src={process.env.PUBLIC_URL + "/img/模版2-循环_640.jpg"}
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
          Add Video
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
              {config.videos.map((video, idx) => {
                return (
                  <Box
                    sx={{
                      position: "relative",
                      width: "99px",
                      height: "56px",
                      cursor: "pointer",
                    }}
                    key={(video?.cover ?? "def") + "," + idx}
                  >
                    <Box
                      component="img"
                      src={coverMap.current.get(video?.cover) ?? addButtons}
                      alt={"" + idx}
                      draggable={false}
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        userSelect: "none",
                        objectFit: "fill",
                      }}
                    />
                    <Uploader onChange={(e) => handleFileUploaded(e, idx)} />
                  </Box>
                );
              })}
              <Box sx={{ position: "relative", minWidth: "1px" }} />
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export const CycleComponentSetting = (props: { name: string }) => {
  const [model, chgModel] = useContext(ModelEditContext)!;
  const config = model.templateData.componentConfig[props.name] as CycleConfig;
  const chgConfig = (config: (draft: CycleConfig) => void) => {
    chgModel((draft) => {
      config(draft.templateData.componentConfig[props.name] as CycleConfig);
    });
  };
  const [videoSelection, setVideoSelection] = useState(0);
  const [uploadState, setUploadState] = useState<
    "noupload" | "uploading" | "uploaded"
  >("noupload");

  useEffect(() => {
    setVideoSelection(0);
  }, [props.name]);

  useEffect(() => {
    setUploadState("noupload");
  }, [videoSelection]);

  const handleFileUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    setUploadState("uploading");
    const file = e.target.files[0];
    const content = await file.arrayBuffer();
    await getWebDavInstance().uploadFile("/Videos/" + file.name, content);
    const url = URIBase + "/Videos/" + file.name;
    chgConfig((config) => {
      if (config.videos[videoSelection]) {
        config.videos[videoSelection]!.url = url;
      } else {
        config.videos[videoSelection] = { url, cover: "", length: null };
      }
    });
    setUploadState("uploaded");
  };

  return (
    <>
      <Stack p={1} spacing={1}>
        <Typography fontWeight="bold">{config.prefix}</Typography>
        <Stack direction="row">
          <Typography>Video(s) in loop</Typography>
          <Box flexGrow={1} />
          <NumberInput
            num={config.videoNumber}
            onChange={(num) => {
              chgConfig((conf) => {
                conf.videoNumber = Math.max(1, num);
                conf.videos = Array.from(new Array(conf.videoNumber)).map(
                  (_) => null
                );
                conf.videoText = Array.from(new Array(conf.videoNumber)).map(
                  (_) => null
                );
              });
            }}
          />
        </Stack>
        <Stack direction="row">
          <Typography mt={1}>Auto Loop</Typography>
          <Box flexGrow={1} />
          <Switch
            checked={config.autoCycle}
            onChange={(e) => {
              chgConfig((conf) => {
                conf.autoCycle = e.target.checked;
              });
            }}
          />
        </Stack>
        <If v-if={false}>
          <Typography>Add Video</Typography>
          <Select
            size="small"
            value={videoSelection}
            onChange={(e) => {
              setVideoSelection(Number(e.target.value));
            }}
          >
            {Array.from(new Array(config.videoNumber)).map((k, idx) => (
              <MenuItem value={idx} key={idx}>
                Video {idx + 1}
              </MenuItem>
            ))}
          </Select>
          <Box
            component="input"
            aria-label="uploader"
            type="file"
            onChange={handleFileUploaded}
          />
          <If v-if={uploadState !== "noupload"}>
            <Typography>
              {uploadState === "uploading" ? "上传中，请等待" : "上传成功"}
            </Typography>
          </If>
        </If>
      </Stack>
    </>
  );
};
