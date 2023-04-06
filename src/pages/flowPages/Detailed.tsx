import { Add, Pause, PlayArrow } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  Fab,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { Updater, useImmer } from "use-immer";
import { v4 } from "uuid";
import { AspectRatio } from "../../components/AspectRatio";
import {
  EditorWrapper,
  emptyLayout,
  removeLayout,
} from "../../components/editor/EditorWrapper";
import { ImagePropertyPage } from "../../components/editor/layouts/Image";
import {
  HVStackPropertyPage,
  ZStackPropertyPage,
} from "../../components/editor/layouts/Stacks";
import { TextPropertyPage } from "../../components/editor/layouts/Text";
import { VideoPropertyPage } from "../../components/editor/layouts/Video";
import { HorizontalScroller } from "../../components/HorizontalScroller";
import { ObservableEvent, Player } from "../../components/Player";
import { ImageProps } from "../../components/player/layouts/Image";
import {
  HVStackProps,
  ZStackProps,
} from "../../components/player/layouts/Stacks";
import { TextProps } from "../../components/player/layouts/Text";
import { VideoProps } from "../../components/player/layouts/Video";
import { ResizableBox } from "../../components/ResizableBox";
import { Timeline } from "../../components/Timeline";
import { Timeline2 } from "../../components/Timeline2";
import { Layout, PlayModel, Scene } from "../../schema/PlayModel";
import { divToImage } from "../../tools/DivToImg";
import { useReactive } from "../../tools/Reactive";

type ComponentNames = "HVStack" | "ZStack" | "Video" | "Text" | "Image";
export const ModelEditContext = React.createContext<
  [PlayModel, Updater<PlayModel>] | null
>(null);

export const Detailed = (props: any) => {
  const theme = useTheme();
  // const modelPack = useImmer(testModel)
  const modelPack = useContext(ModelEditContext)!;
  const [model, chgModel] = modelPack;
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [playState, chgPlayState] = useImmer({
    playing: false,
  });
  const divRef = useRef<HTMLDivElement>(null);

  const { objTab, root, events } = model;
  const scene = objTab[root] as Scene;

  const [rootLayout, setRootLayout] = useState<string>(scene.rootLayout);

  const [preview, setPreview] = useState(false)
  const [showVideo, setShowVideo] = useState(true)
  const fakeReactive = useReactive<ObservableEvent>(() => {}, [])

  const reactive = useReactive<ObservableEvent>(
    (r) => {
      r.map((e) => {
        console.log(e);
      });
      r.filter((e) => e.event === "select" || e.event === "unselect").map(
        (e) => {
          setSelectedLayout(e.event === "select" ? e.sender : null);
        }
      );
      r.filter(
        (e) => e.layout === "timeline" && e.event === "jump" && e.args.isLeaf
      ).map((e) => {
        console.log(e);
        const [newLayout, newTime] = e.args.time as [string, number];
        setRootLayout((oldLayout) => {
          if (oldLayout !== newLayout) {
            setSelectedLayout(null);
          }
          return newLayout;
        });
      });
    },
    [model]
  );

  const handleAddClick = (component: ComponentNames) => {
    if (selectedLayout === null) {
      return;
    }
    const selected: Layout = objTab[selectedLayout];
    const layout: Layout = {
      id: v4(),
      type: component,
      layoutType: "Layout",
      parent: selected.parent,
      endTo: null,
      data: {},
    };
    const children =
      component === "HVStack"
        ? [emptyLayout(layout.id), emptyLayout(layout.id)]
        : [];

    switch (component) {
      case "HVStack":
        layout.data = {
          children: [
            { space: 1, content: children[0].id },
            { space: 1, content: children[1].id },
          ],
          vertical: false,
        } as HVStackProps["data"];
        break;
      case "ZStack":
        layout.data = {
          children: [],
        } as ZStackProps["data"];
        break;
      case "Image":
        layout.data = {
          src: "",
          sx: {},
        } as ImageProps["data"];
        break;
      case "Text":
        layout.data = {
          content: "",
          sx: {},
        } as TextProps["data"];
        break;
      case "Video":
        layout.data = {
          src: "",
          loop: false,
          time: 0,
          volume: 100,
          length: 0,
          play: false,
          sx: {},
        } as VideoProps["data"];
        break;
    }

    chgModel((draft) => {
      if (selected.type === "ZStack") {
        (draft.objTab[selectedLayout].data as ZStackProps["data"]).children.push({
          pos: {left: 10, top: 10, width: 30, height: 30},
          content: layout.id
        })
      } else {
        const parent = selected.parent
          ? (draft.objTab[selected.parent] as Layout)
          : null;
        if (parent) {
          const data: HVStackProps["data"] | ZStackProps["data"] = parent.data;
          for (let i = 0; i < data.children.length; i++) {
            const child = data.children[i];
            if (child.content === selected.id) {
              data.children[i].content = layout.id;
            }
          }
        } else {
          const root = draft.objTab[draft.root] as Scene;
          root.rootLayout = layout.id;
        }
        removeLayout(selected.id, draft.objTab);
      }
      draft.objTab[layout.id] = layout;
      for (const i of children) {
        draft.objTab[i.id] = i;
      }
      setSelectedLayout(layout.id);
    });
  };

  const handlePlayClick = () => {
    chgPlayState((state) => {
      state.playing = !state.playing;
    });
  };

  return (
    <Grid container sx={{ height: "100%" }} direction="column">
      <Grid item container md direction="row">
        <Grid item md sx={{ position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              height: "100%",
              backgroundColor: theme.palette.grey[100],
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "80%",
                aspectRatio: "16 / 9",
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.common.white,
                userSelect: "none",
              }}
              ref={divRef}
            >
              {/* <ModelEditContext.Provider value={modelPack}> */}
              <EditorWrapper
                layout={objTab[rootLayout] as Layout}
                reactive={reactive}
                objs={objTab}
                state={playState}
              />
              {/* </ModelEditContext.Provider> */}
            </Box>
          </Box>
          <Box sx={{ position: "absolute", right: "8px", bottom: "8px" }}>
            <PopupState variant="popover" popupId="detailedPopup">
              {(popupState) => (
                <>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        handleAddClick("HVStack");
                      }}
                    >
                      Split Layout
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        handleAddClick("ZStack");
                      }}
                    >
                      Window Layout
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        handleAddClick("Video");
                      }}
                    >
                      Video
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        handleAddClick("Text");
                      }}
                    >
                      Text
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popupState.close();
                        handleAddClick("Image");
                      }}
                    >
                      Image
                    </MenuItem>
                  </Menu>
                  <Fab
                    color="primary"
                    size="medium"
                    {...bindTrigger(popupState)}
                  >
                    <Add />
                  </Fab>
                </>
              )}
            </PopupState>
            <br />
            <Fab
              color="primary"
              size="medium"
              sx={{ mt: "8px" }}
              onClick={handlePlayClick}
            >
              {playState.playing ? <Pause /> : <PlayArrow />}
            </Fab>
          </Box>
          <Box
            sx={{
              position: "absolute",
              right: "16px",
              top: "16px",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              sx={{ height: "32px" }}
              onClick={() => setPreview(true)}
            >
              Preview
            </Button>
          </Box>
          <Dialog
            open={preview}
            onClose={() => setPreview(false)}
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
        </Grid>
        <Grid
          item
          width="300px"
          sx={{
            borderLeft: `1px solid ${theme.palette.divider}`,
            position: "relative",
            p: 1,
          }}
        >
          {/* <Typography fontSize="1.3em">属性设置</Typography> */}
          {/* <ModelEditContext.Provider value={modelPack}> */}
          {(() => {
            if (!selectedLayout) return <></>;
            const selected: Layout = objTab[selectedLayout];
            const props = { layout: selected };
            switch (selected.type as ComponentNames) {
              case "HVStack":
                return <HVStackPropertyPage {...props} />;
              case "ZStack":
                return <ZStackPropertyPage {...props} />;
              case "Image":
                return <ImagePropertyPage {...props} />;
              case "Video":
                return <VideoPropertyPage {...props} />;
              case "Text":
                return <TextPropertyPage {...props} />;
            }
          })()}
          {/* </ModelEditContext.Provider> */}
        </Grid>
      </Grid>
      <Grid
        item
        height="183px"
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          position: "relative",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Timeline2 data={model} timeReactive={reactive} />
      </Grid>
    </Grid>
  );
};
