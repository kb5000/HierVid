import { Pause, PlayArrow, Preview } from "@mui/icons-material";
import { Box, Button, Dialog, Fab, Stack, useTheme } from "@mui/material";
import { useState, useContext, useCallback, useEffect } from "react";
import { useImmer } from "use-immer";
import { ComponentPlayer } from "../../components/ComponentPlayer";
import { ObservableEvent, Player } from "../../components/Player";
import { JumpAction } from "../../components/player/events/Actions";
import { TimelineComponent } from "../../components/TimelineComponent";
import {
  ComponentModel,
  Layout,
  PlayModel,
  Scene,
} from "../../schema/PlayModel";
import { useReactive } from "../../tools/Reactive";
import { ModelEditContext } from "./Detailed";

export const testModel = () =>
  ({
    root: "root",
    objTab: {
      root: {
        data: {},
        rootLayout: "rootLayout",
        rootComponent: "returnComponent",
      } as Scene,
      rootLayout: {
        id: "rootLayout",
        type: "ZStack",
        layoutType: "Layout",
        data: {
          children: [
            {
              pos: {
                left: 0,
                top: 0,
                width: 100,
                height: 100,
              },
              content: "bottomH",
            },
            {
              pos: {
                left: 30,
                top: 70,
                width: 40,
                height: 10,
              },
              content: "text",
            },
          ],
        },
      } as Layout,
      bottomH: {
        id: "bottomH",
        type: "HVStack",
        layoutType: "Layout",
        parent: "rootLayout",
        data: {
          vertical: false,
          children: [
            { space: 1, content: "video1" },
            { space: 1, content: "video2" },
            { space: 1, content: "video3" },
          ],
        },
      } as Layout,
      text: {
        id: "text",
        type: "Text",
        layoutType: "Layout",
        parent: "rootLayout",
        data: {
          content: "点击你喜欢的衣服",
          sx: {
            userSelect: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "22px",
            WebkitTextStroke: "0.6px white",
            background: "rgba(0,0,0,0.3)",
          } as React.CSSProperties,
        },
      } as Layout,
      video1: {
        id: "video1",
        type: "Video",
        layoutType: "Layout",
        parent: "bottomH",
        data: {
          src: "http://175.24.176.136:15060/Videos/video-2zAnK0WXRb.mp4",
          sx: { objectFit: "cover" },
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      video2: {
        id: "video2",
        type: "Video",
        layoutType: "Layout",
        parent: "bottomH",
        data: {
          src: "http://175.24.176.136:15060/Videos/video-v4Kz5j7Sit.mp4",
          sx: { objectFit: "cover" },
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      video3: {
        id: "video3",
        type: "Video",
        layoutType: "Layout",
        parent: "bottomH",
        data: {
          src: "http://175.24.176.136:15060/Videos/video-ixOWNf4RZu.mp4",
          sx: { objectFit: "cover" },
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      bigVideo1: {
        id: "bigVideo1",
        type: "Video",
        layoutType: "Layout",
        data: {
          src: "http://175.24.176.136:15060/Videos/video-2zAnK0WXRb.mp4",
          sx: { objectFit: "cover" } as React.CSSProperties,
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      bigVideo2: {
        id: "bigVideo2",
        type: "Video",
        layoutType: "Layout",
        data: {
          src: "http://175.24.176.136:15060/Videos/2-7.mp4",
          sx: { objectFit: "cover" } as React.CSSProperties,
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      bigVideo3: {
        id: "bigVideo3",
        type: "Video",
        layoutType: "Layout",
        data: {
          src: "http://175.24.176.136:15060/Videos/3-5.mp4",
          sx: { objectFit: "cover" } as React.CSSProperties,
          loop: true,
          time: 0,
          volume: 100,
          length: 0,
          play: true,
        },
      } as Layout,
      returnComponent: {
        id: "returnComponent",
        type: "Sequential",
        layoutType: "Component",
        parent: null,
        endTo: null,
        children: [
          { type: "Layout", id: "rootLayout" },
          { type: "Component", id: "parComponent" },
          { type: "Layout", id: "textLayout" },
        ],
      } as ComponentModel,
      parComponent: {
        id: "parComponent",
        type: "Parallel",
        layoutType: "Component",
        parent: "returnComponent",
        endTo: "rootLayout",
        children: [
          { type: "Layout", id: "bigVideo1" },
          { type: "Layout", id: "bigVideo2" },
          { type: "Layout", id: "bigVideo3" },
        ],
      } as ComponentModel,
      textLayout: {
        id: "textLayout",
        type: "HVStack",
        layoutType: "Layout",
        data: {
          vertical: false,
          children: [
            { space: 1, content: "leftText" },
            { space: 1, content: "rightText" },
          ],
        },
      } as Layout,
      leftText: {
        id: "leftText",
        type: "Text",
        layoutType: "Layout",
        data: {
          content: "左边的测试内容",
          sx: {
            userSelect: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "22px",
            WebkitTextStroke: "0.6px white",
            background: "rgba(0,0,0,0.3)",
          } as React.CSSProperties,
        },
      } as Layout,
      rightText: {
        id: "rightText",
        type: "Text",
        layoutType: "Layout",
        data: {
          content: "右边的测试内容",
          sx: {
            userSelect: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "22px",
            WebkitTextStroke: "0.6px white",
            background: "rgba(0,0,0,0.3)",
          } as React.CSSProperties,
        },
      } as Layout,
    },
    events: [
      {
        sender: "video1",
        event: "onClick",
        action: "jump",
        args: {
          target: "bigVideo1",
        },
      } as JumpAction,
      {
        sender: "video2",
        event: "onClick",
        action: "jump",
        args: {
          target: "bigVideo2",
        },
      } as JumpAction,
      {
        sender: "video3",
        event: "onClick",
        action: "jump",
        args: {
          target: "bigVideo3",
        },
      } as JumpAction,
      {
        sender: "bigVideo1",
        event: "onClick",
        action: "jump",
        args: {
          target: "textLayout",
        },
      } as JumpAction,
      {
        sender: "bigVideo2",
        event: "onClick",
        action: "jump",
        args: {
          target: "rootLayout",
        },
      } as JumpAction,
      {
        sender: "bigVideo3",
        event: "onClick",
        action: "jump",
        args: {
          target: "rootLayout",
        },
      } as JumpAction,
      {
        sender: "leftText",
        event: "onClick",
        action: "jump",
        args: {
          target: "rootLayout",
        },
      } as JumpAction,
    ],
    timeNodes: {
      n1: {
        id: "n1",
        parent: null,
        width: 144,
        data: {},
        ports: [{ target: "n3", fromTime: 1, toTime: 0 }],
      },
      n2: {
        id: "n2",
        parent: null,
        width: 144,
        data: {},
        ports: [
          { target: "n3a", fromTime: 1, toTime: 0 },
          { target: "n3b", fromTime: 0.2, toTime: 0 },
        ],
      },
      n3: {
        id: "n3",
        parent: null,
        width: 144,
        data: {},
        ports: [{ target: "n1", fromTime: 1, toTime: 0 }],
      },
      n4: {
        id: "n4",
        parent: null,
        width: 144,
        data: {},
        ports: [],
      },
      n3a: {
        id: "n3a",
        parent: "n3",
        width: 144,
        data: {},
        ports: [],
      },
      n3b: {
        id: "n3b",
        parent: "n3",
        width: 144,
        data: {},
        ports: [],
      },
    },
    timeArrs: {
      _null: ["n1", "n2", "n3", "n4"],
      n3: ["n3a", "n3b"],
    },
    templateData: {
      selectedClass: "",
      template: "",
      templateConfig: null,
      componentConfig: {},
      currentConfig: null,
    },
  } as PlayModel);

export const Component = (props: any) => {
  const theme = useTheme();
  const [model, chgModel] = useContext(ModelEditContext)!;
  const [playing, setPlaying] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const fakeReactive = useReactive<ObservableEvent>((r) => {}, [model]);
  const timeReactive = useReactive<ObservableEvent>((r) => {}, [model]);

  const handlePlayClick = () => {
    timeReactive.emit({
      sender: "Component",
      event: "playState",
      layout: "Component",
      args: { playing: !playing },
    });
    setPlaying((orig) => {
      return !orig;
    });
  };

  useEffect(() => {
    timeReactive.emit({
      sender: "Component",
      event: "playState",
      layout: "Component",
      args: { playing: playing },
    });
  }, []);

  return (
    <Stack sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <ComponentPlayer data={model} timeReactive={timeReactive} />
        <Box
          sx={{
            position: "absolute",
            right: "8px",
            bottom: "8px",
          }}
        >
          <Fab
            color="primary"
            size="medium"
            sx={{ mt: "8px" }}
            onClick={handlePlayClick}
            title={playing ? "暂停" : "播放"}
          >
            {playing ? <Pause /> : <PlayArrow />}
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
      </Box>
      <Box
        sx={{
          position: "relative",
          height: "184px",
          width: "100%",
          background: theme.palette.common.white,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TimelineComponent data={model} timeReactive={timeReactive} />
      </Box>
      <Dialog open={preview} onClose={() => setPreview(false)} maxWidth={false}>
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
    </Stack>
  );
};
