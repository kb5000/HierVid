import { ArrowBack, Edit, EditOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Input,
  Paper,
  setRef,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AspectRatio } from "../../../components/AspectRatio";
import addButtons from "../../../assets/img/addButton.svg";
import { Else, If } from "../../../components/Vue";
import { Uploader } from "../../../components/Uploader";
import React from "react";
import { getVideoCover, getWebDavInstance, URIBase } from "../../../tools/Backend";
import { Layout, PlayModel } from "../../../schema/PlayModel";
import { ModelEditContext } from "../Detailed";

interface SlotContent {
  imgUrl: string;
  videoUrl: string | null;
  coverageImage: string;
  coverageVideo: string | null;
}

export const ComparisonEdit = (props: any) => {
  const theme = useTheme();
  const [page, setPage] = useState(props.firstPage === -1 ? 1 : 0);
  const [slots, setSlots] = useState<(SlotContent | null)[]>([
    null,
    null,
    null,
  ]);
  const [smartEnabled, setSmartEnabled] = useState(false);
  const [tabs, setTabs] = useState([
    {
      name: "正面",
      selections: [
        ["img/comp/tab/a2.png"],
        ["img/comp/tab/b2.png", "img/comp/tab/b3.png"],
        ["/img/comp/tab/c1.png", "img/comp/tab/c2.png"],
      ],
    },
    {
      name: "左侧",
      selections: [
        ["/img/comp/tab/a1.png", "img/comp/tab/a2.png"],
        ["/img/comp/tab/b1.png", "img/comp/tab/b2.png", "img/comp/tab/b3.png"],
        ["/img/comp/tab/c1.png", "img/comp/tab/c2.png", "img/comp/tab/c3.png"],
      ],
    },
    {
      name: "右侧",
      selections: [],
    },
    {
      name: "背面",
      selections: [],
    },
  ]);
  const [currentTab, setCurrentTab] = useState(0);
  const slotSizes = useRef<Record<number, [number, number]>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement>>({});

  const [model, chgModel] = useContext(ModelEditContext)!

  const generateConfig = (draft: PlayModel) => {
    (draft.objTab["video1"] as Layout).data.src = slots[0]?.videoUrl!;
    (draft.objTab["video2"] as Layout).data.src = slots[1]?.videoUrl!;
    (draft.objTab["video3"] as Layout).data.src = slots[2]?.videoUrl!;
    (draft.objTab["bigVideo1"] as Layout).data.src = slots[0]?.videoUrl!;
    (draft.objTab["bigVideo2"] as Layout).data.src = slots[1]?.videoUrl!;
    (draft.objTab["bigVideo3"] as Layout).data.src = slots[2]?.videoUrl!;
  }

  const handleLast = () => {
    if (page === 0) {
      props.handleLast();
    } else {
      setPage((p: number) => p - 1);
    }
  };

  const handleNext = () => {
    if (page === 1) {
      chgModel(generateConfig)
      props.handleNext();
    } else {
      setPage((p: number) => p + 1);
    }
  };

  const handleFileUploaded = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (!e.target.files?.length) {
      return;
    }
    const file = e.target.files[0];
    const content = await file.arrayBuffer();
    await getWebDavInstance().uploadFile("/Videos/" + file.name, content)
    const turl = URL.createObjectURL(file);
    const url = URIBase + "/Videos/" + file.name
    const [width, height] = slotSizes.current[idx] || [400, 800];
    console.log(width, height);
    const cover = await getVideoCover(turl);
    setSlots((slots) => {
      const state = [...slots];
      if (page === 0) {
        state[idx] = {
          imgUrl: cover,
          videoUrl: url,
          coverageImage: state[idx]?.coverageImage || "",
          coverageVideo: state[idx]?.coverageVideo || null
        };
      } else if (page === 1) {
        state[idx] = {
          imgUrl: state[idx]?.imgUrl || "",
          videoUrl: state[idx]?.videoUrl || null,
          coverageImage: cover,
          coverageVideo: url,
        };
      }

      return state;
    });
    console.log(e, cover);
  };

  useEffect(() => {
    const web = getWebDavInstance()
    // web.uploadFile('a.txt', "xxxtest").then(console.log)
    // web.getFile('/a.txt').then(console.log)
    web.containsFile('/a.txt').then((x) => console.log(x ? "contains" : "not contain"))
    // web.delete('/tst').then(console.log)
  }, [])
  
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
            返回
          </Button>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            size="small"
            sx={{ height: "32px" }}
            onClick={handleNext}
          >
            下一步
          </Button>
        </Stack>
        <Stack sx={{ alignItems: "center", flexGrow: 1 }}>
          <Typography fontWeight="500" mt={1}>
            {page === 0
              ? "步骤1：请上传3套服装的整体展示视频"
              : "步骤2：请上传3套服装的正面站定展示图片/视频"}
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
              >
                <Stack
                  direction="row"
                  sx={{ position: "relative", height: "100%" }}
                >
                  {slots.map((x, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flexGrow: 1,
                        flexShrink: 0,
                        position: "relative",
                        height: "100%",
                        "&:not(:last-child)": {
                          borderRight: `1px solid ${theme.palette.divider}`,
                        },
                      }}
                      ref={(ref: HTMLDivElement | null) => {
                        if (ref) {
                          slotSizes.current[idx] = [
                            ref.clientWidth,
                            ref.clientHeight,
                          ];
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {x === null || ((page === 0 && !x.imgUrl) || (page === 1 && !x.coverageImage)) ? (
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
                            <Box
                              component="img"
                              src={addButtons}
                              sx={{ width: "50%" }}
                            />
                          </Box>
                        ) : (
                            <Box
                              component="img"
                              src={page === 0 ? x.imgUrl : x.coverageImage}
                              sx={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                                objectFit: "cover",
                                overflow: "hidden",
                              }}
                            />
                        )}
                        <Uploader
                          ref={(ref) => {
                            if (ref) fileRefs.current[idx] = ref;
                          }}
                          onChange={(e) => handleFileUploaded(e, idx)}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    position: "absolute",
                    left: "16px",
                    top: "16px",
                    background: theme.palette.common.white,
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: "4px",
                    border: "none",
                    "&:hover": { border: "none", background: theme.palette.grey[100] },
                  }}
                >
                  <EditOutlined sx={{ fontSize: "18px", mr: 1 }} />
                  编辑模板
                </Button>
              </Box>
            </AspectRatio>
          </Box>
        </Stack>
        <If v-if={page === 1}>
          <If v-if={smartEnabled}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "160px",
                background: theme.palette.common.white,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack direction="row" px={3} py={1}>
                <Typography sx={{ position: "relative", mt: 1, ml: 1 }}>
                  智能识别
                </Typography>
                <Switch
                  checked={smartEnabled}
                  onChange={(e, checked) => setSmartEnabled(checked)}
                />
                <Tabs
                  value={currentTab}
                  onChange={(e, val) => setCurrentTab(val)}
                  sx={{ minHeight: "24px" }}
                >
                  {tabs.map((val) => (
                    <Tab
                      label={val.name}
                      key={val.name}
                      sx={{ minHeight: "24px", py: "9.5px", minWidth: "40px" }}
                    />
                  ))}
                </Tabs>
              </Stack>
              <Stack
                direction="row"
                sx={{ position: "relative", flexGrow: 1, px: 3, py: 1 }}
              >
                {tabs[currentTab].selections.map((val, idx) => (
                  <Stack direction="row" key={idx} mx={1}>
                    {val.map((img, idy) => (
                      <Box
                        key={img}
                        component="img"
                        src={process.env.PUBLIC_URL + img}
                        sx={{
                          width: "60px",
                          height: "90px",
                          objectFit: "fill",
                        }}
                      ></Box>
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Else>
              <Paper sx={{ position: "absolute", left: 0, bottom: "0px" }}>
                <Stack direction="row">
                  <Typography sx={{ position: "relative", mt: 1, ml: 1 }}>
                    智能识别
                  </Typography>
                  <Switch
                    checked={smartEnabled}
                    onChange={(e, checked) => setSmartEnabled(checked)}
                  />
                </Stack>
              </Paper>
            </Else>
          </If>
        </If>
      </Box>
    </>
  );
};
