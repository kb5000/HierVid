import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  useTheme,
  Grid,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Dialog,
  DialogContent,
  Paper,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  AccountCircle,
  Close,
  ExpandMore,
  Menu,
  Notifications,
  Save,
  SpaceBar,
  Star,
} from "@mui/icons-material";
import {
  ComAccordion,
  ComAccordionSummary,
  ComAccordionDetails,
} from "../components/Accordions";
import React, { useContext, useEffect, useState } from "react";
import { ComMenuItem } from "../components/MenuItem";
import { SelectClass } from "./flowPages/SelectClass";
import { SelectTemplate } from "./flowPages/SelectTemplate";
import { Template } from "../schema/Basic";
import { Context } from "../schema/Model";
import { Component, testModel } from "./flowPages/Component";
import { ListSelection } from "./selections/ListSelection";
import { If } from "../components/Vue";
import { TaggedSelection } from "./selections/TaggedSelection";
import { Detailed, ModelEditContext } from "./flowPages/Detailed";
import { useImmer } from "use-immer";
import { PlayModel } from "../schema/PlayModel";
import { ModelContext } from "../tools/ModelContext";
import { useParams } from "react-router";
import { Webdav } from "../tools/Webdav";
import { getWebDavInstance } from "../tools/Backend";
import { SnackbarProvider } from "notistack";
import { ComponentEditor } from "./selections/ComponentEditor";
import { useSearchParams } from "react-router-dom";
import { Player } from "../components/Player";
import { useReactive } from "../tools/Reactive";

const menuData = [
  {
    name: "Category",
    content: [
      { name: "Recommended", star: true },
    ],
  },
  {
    name: "Template",
    content: [
      { name: "Recommended", star: true },
    ],
  },
  {
    name: "Module Editor",
    content: [
      { name: "分支嵌套组件-分割布局", img: "/img/comp/select/c1.png" },
      { name: "分支嵌套组件-单视频", img: "/img/comp/select/c2.png" },
      { name: "剧情分支组件", img: "/img/comp/select/c3.png" },
    ],
  },
  {
    name: "Unit Editor",
    content: [
      { name: "Config 1" },
      // { name: "场景2" },
    ],
  },
];

const classSelectData: Record<string, any> = (() => {
  const res = {
    Recommended: [
    ],
  };
  const extra = [
    "Branding",
    "Festival Marketing",
    "Mini Story",
    "Portfolio",
    "Product Recommender",
    "Product Showcasing",
    "Quiz \u0026 Test",
    "Social Interactive",
    "Virtual Tour",
  ];
  for (const i of extra) {
    res["Recommended"].push({
      text: i,
      img: "/img/esite/cat/" + i.replaceAll(" ", "") + ".jpg",
      description: "",
    });
  }
  return res;
})();

const templateSelectData: Record<string, any> = (() => {
  const res = {
    Recommended: [] as any[],
  };
  const extra = [
    "Accessories",
    "Brown Goods",
    "Cosmetics",
    "Fashion Dressing",
    "Jewellery",
    "Mobile Apps",
    "Mobile Devices",
    "Small Household Appliances",
    "Soft Decoration",
    "Sportswear",
    "Toys",
    "White Goods",
  ];
  let idx = 0;
  for (const i of extra) {
    res["Recommended"].push({
      text: i,
      img: "/img/esite/tem/" + i.replaceAll(" ", "") + ".jpg",
      type: idx === 0 ? "Branch" : idx === 1 ? "Cycle" : "Check",
      description:
        idx === 0
          ? {
              shortText: "Multi-ending",
              aspectRatio: "Landscape 16:9",
              video: "",
            }
          : idx === 1
          ? {
              shortText: "Linear / Loop",
              aspectRatio: "Landscape 16:9",
              video: "",
            }
          : {
              shortText: "Shuttled Jump",
              aspectRatio: "Landscape 16:9",
              video: "",
            },
    });
    idx += 1;
  }
  return res;
})();

export const PHome = (props: any) => {
  const theme = useTheme();
  const [activeMenu, setActiveMenu] = useState([0, 0]);
  const [model, chgModel] = useContext(ModelEditContext)!;
  const config = useParams()?.config ?? "main";
  const [activeRange, setActiveRange] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(-1);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const fakeReactive = useReactive<any>(() => {}, []);

  const handleNextClick = (idx: number) => {
    if (idx < 2) {
      setActiveRange((orig) => Math.max(orig, idx));
    } else {
      setActiveRange(3);
    }
    setActiveMenu([idx, 0]);
  };

  const handleSaveClick = () => {
    const res = JSON.stringify(model);
    console.log(model);
    const instance = getWebDavInstance();
    instance.uploadFile("/config/" + config, res);
  };

  const handlePreviewClick = () => {
    console.log(model);
    setActiveRange(3);
    setPreviewDialogOpen(true);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="static"
        sx={{ boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.1)" }}
      >
        <Toolbar
          variant="dense"
          sx={{ backgroundColor: theme.palette.common.white }}
        >
          {/* <IconButton
          size="large"
          edge="start"
          sx={{ color: theme.palette.text.primary, mr: 2 }}
          aria-label="menu"
        >
          <Menu />
        </IconButton> */}
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            color={theme.palette.text.primary}
          >
            HierVid
          </Typography>
          <IconButton
            sx={{ color: theme.palette.text.primary, mr: 1 }}
            onClick={handlePreviewClick}
          >
            <Notifications />
          </IconButton>
          <IconButton
            sx={{ color: theme.palette.text.primary }}
            onClick={handleSaveClick}
          >
            <Save />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: "relative", flex: "1" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid item md={2}>
            <Box
              sx={{
                borderRight: `1px solid ${theme.palette.divider}`,
                height: "100%",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  overflow: "auto",
                }}
              >
                {menuData.map((x, idx) => (
                  <ComAccordion
                    key={x.name}
                    disabled={idx > activeRange}
                    expanded={idx === activeMenu[0]}
                    onChange={() => {
                      if (activeMenu[0] === 1) {
                        setDialogOpen(idx);
                        return;
                      }
                      idx === activeMenu[0]
                        ? setActiveMenu([-1, 0])
                        : setActiveMenu([idx, 0]);
                    }}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <ComAccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>{x.name}</Typography>
                    </ComAccordionSummary>
                    <ComAccordionDetails>
                      <If v-if={activeMenu[0] === 0 || activeMenu[0] === 1}>
                        <ListSelection
                          content={x.content as any}
                          activeIdx={activeMenu[1]}
                          onClick={(idy) => setActiveMenu([idx, idy])}
                        />
                      </If>
                      <If v-if={activeMenu[0] === 2}>
                        <ComponentEditor />
                      </If>
                      <If v-if={activeMenu[0] === 3}>
                        <ListSelection
                          content={x.content as any}
                          activeIdx={activeMenu[1]}
                          onClick={(idy) => setActiveMenu([idx, idy])}
                        />
                      </If>
                    </ComAccordionDetails>
                  </ComAccordion>
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid item md={10}>
            <Box
              sx={{
                position: "relative",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  overflow: "auto",
                  background: theme.palette.grey[100],
                }}
              >
                {
                  [
                    <Box sx={{ background: theme.palette.grey[100] }}>
                      <SelectClass
                        name={
                          menuData[activeMenu[0]]?.content[activeMenu[1]]?.name
                        }
                        data={
                          classSelectData[
                            menuData[activeMenu[0]]?.content[activeMenu[1]]
                              ?.name
                          ]
                        }
                        onNextClick={() => handleNextClick(1)}
                      />
                    </Box>,
                    <SelectTemplate
                      name={
                        menuData[activeMenu[0]]?.content[activeMenu[1]]?.name
                      }
                      data={
                        templateSelectData[
                          menuData[activeMenu[0]]?.content[activeMenu[1]]?.name
                        ]
                      }
                      onNextClick={() => handleNextClick(2)}
                    />,
                    <Component />,
                    <Detailed />,
                  ][activeMenu[0]]
                }
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={dialogOpen !== -1} onClose={() => setDialogOpen(-1)}>
        <DialogContent>
          <DialogContentText>
            Switch to another page? Your unsaved data may lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActiveMenu([dialogOpen, 0]);
              setDialogOpen(-1);
            }}
          >
            Yes
          </Button>
          <Button onClick={() => setDialogOpen(-1)}>否</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth={false}
      >
        <Box
          sx={{
            position: "relative",
            ml: 4,
            width: "723px",
            height: "458px",
          }}
        >
          {showVideo && <Player data={model} timeReactive={fakeReactive} />}
        </Box>
        <Stack direction="row" sx={{ px: 6, pb: 2 }}>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            size="small"
            sx={{ height: "32px", ml: 3 }}
            onClick={() => {
              setShowVideo(false);
              setTimeout(() => setShowVideo(true), 16);
            }}
          >
            Replay
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
};

export const Home = (props: any) => {
  // const [params] = useSearchParams()
  // const config = params.get('config') ?? "main"
  const config = useParams()?.config ?? "main";
  const [model, chgModel] = useImmer(testModel());

  const acquireConfig = async () => {
    const instance = getWebDavInstance();
    if (!(await instance.containsFile("/config/" + config))) {
      await instance.uploadFile("/config/" + config, testModel());
    }
    const fetchedModel = await (
      await instance.getFile("/config/" + config)
    ).data;
    console.log(fetchedModel);
    chgModel(fetchedModel);
  };

  useEffect(() => {
    acquireConfig();
  }, []);

  return (
    <ModelEditContext.Provider value={[model, chgModel]}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <PHome {...props} />
      </SnackbarProvider>
    </ModelEditContext.Provider>
  );
};
