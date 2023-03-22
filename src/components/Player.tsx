import { Box, Stack, useTheme } from "@mui/material";
import { produce } from "immer";
import { useImmer } from "use-immer";
import { useContext, useEffect, useRef, useState } from "react";
import { ComponentModel, Layout, pickFirst, pickFirst2, pickNext, pickNext2, PlayModel, Scene } from "../schema/PlayModel";
import { Observable, useReactive, useObserve } from "../tools/Reactive";
import { AspectRatio } from "./AspectRatio";
import { LayoutWrapper } from "./player/LayoutWrapper";
import { ModelEditContext } from "../pages/flowPages/Detailed";

export interface ObservableEvent {
  sender: string;
  layout: string;
  event: string;
  args: Record<string, any>;
}

export const calcMainVideo = (layout: Layout, objTab: Record<string, any>) => {
  const times: Record<string, number> = {}
  let longestVideo: string | null = null;
  if (!layout) {
    return {times, longestVideo}
  }
  const stk = [layout]
  while (stk.length > 0) {
    const top = stk.pop()!
    if (["ZStack", "HVStack"].includes(top.type)) {
      for (const i of top.data.children) {
        stk.push(objTab[i.content])
      }
    } else if (top.type === "Video") {
      times[top.id] = top.data.length ?? Infinity
      if (!longestVideo || times[top.id] > times[longestVideo]) {
        longestVideo = top.id
      }
    }
  }
  return {
    times, longestVideo
  }
}

export const Player = (props: { data: PlayModel, timeReactive?: Observable<ObservableEvent> }) => {
  const { objTab, root, events } = props.data;
  const scene = objTab[root] as Scene;

  const theme = useTheme();
  const [layout, setLayout] = useState<Layout>(objTab[pickFirst2(null, props.data)!]);
  const [videoTimes, setVideoTimes] = useState<Record<string, number>>({})
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [mainVideo, setMainVideo] = useState<string | null>()
  const [playState, chgPlayState] = useImmer({
    playing: true,
  })

  useEffect(() => {
    setMainVideo(undefined)
    
    const {times, longestVideo} = calcMainVideo(layout, objTab)
    setVideoTimes(times)
    setMainVideo(longestVideo)
  }, [layout, objTab])

  const reactive = useReactive<ObservableEvent>(
    r => {
      r
        .filter(e => e.event === "onTimeUpdate" && e.sender === mainVideo)
        .delta((l, c) => l.args.time === c.args.time)
        .map((e) => {
          setCurrentTime(e.args.time)
          props.timeReactive?.emit({
            sender: layout.id,
            layout: "Player",
            event: "jump",
            args: {
              time: [layout.id, e.args.time / videoTimes[mainVideo!]],
            }
          })
          console.log(e.args.time, mainVideo)
        })
      r
        .filter(e => e.event === "onEnded" && e.sender === mainVideo)
        .map(e => {
          console.log("ended")
          const next = pickNext2(layout.id, props.data)
          if (next) {
            setLayout(objTab[next])
            props.timeReactive?.emit({
              sender: next,
              layout: "Player",
              event: "jump",
              args: {
                time: [next, 0],
              }
            })
          }
        })
      r
        .filter((e) => e.event === "onClick")
        .map((e) => {
          events.forEach((handler) => {
            if (handler.sender === e.sender && handler.event === "onClick") {
              if (handler.action === "jump") {
                const next = pickFirst2(handler.args.target, props.data)
                if (next) {
                  setLayout(objTab[next]);
                  props.timeReactive?.emit({
                    sender: next,
                    layout: "Player",
                    event: "jump",
                    args: {
                      time: [next, 0],
                    }
                  })
                }
              }
            }
          })
        })
    },
    [events, mainVideo, objTab]
  );

  useObserve(props.timeReactive!, r => {
    r
      .filter(e => e.layout === "timeline" && e.event === "jump" && e.args.isLeaf)
      .map(e => {
        console.log(e)
        setLayout(objTab[e.args.time[0]])
        const newMain = calcMainVideo(objTab[e.args.time[0]], objTab)
        if (newMain.longestVideo) {
          const newTime = newMain.times[newMain.longestVideo] * e.args.time[1]
          reactive.emit({
            event: "setTime",
            sender: "Player",
            layout: "Player",
            args: {
              time: newTime
            }
          })
        } else {
          setCurrentTime(0)
        }
      })
    r
      .filter(e => e.layout === "Component" && e.event === "playState")
      .map(e => {
        chgPlayState(model => {model.playing = e.args.playing})
      })
  }, [mainVideo, reactive, objTab])

  return (
    <Stack sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box
        sx={{
          my: 4,
          position: "relative",
          flexGrow: 1,
          width: "100%",
        }}
      >
        <AspectRatio aspectratio="16 / 9">
          <Box
            sx={{
              position: "relative",
              width: "calc(100% - 32px)",
              height: "100%",
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.common.white,
            }}
          >
            <LayoutWrapper
              layout={layout}
              reactive={reactive}
              objs={objTab}
              state={playState}
            />
          </Box>
        </AspectRatio>
      </Box>
    </Stack>
  );
};
