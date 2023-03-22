import { Box, Stack, useTheme } from "@mui/material";
import { produce } from "immer";
import { useImmer } from "use-immer";
import { useContext, useEffect, useRef, useState } from "react";
import { ComponentModel, Layout, pickFirst, pickFirst2, pickNext, pickNext2, PlayModel, Scene } from "../schema/PlayModel";
import { Observable, useReactive, useObserve } from "../tools/Reactive";
import { AspectRatio } from "./AspectRatio";
import { LayoutWrapper } from "./player/LayoutWrapper";
import { ModelEditContext } from "../pages/flowPages/Detailed";
import { ObservableEvent, calcMainVideo } from "./Player";
import { BranchConfig } from "../pages/flowPages/Branch/Config";
import { CycleConfig } from "../pages/flowPages/Cycle/Config";
import { CheckConfig } from "../pages/flowPages/Check/Config";
import { getWebDavInstance, URIBase } from "../tools/Backend";

export const ComponentPlayer = (props: { data: PlayModel, timeReactive?: Observable<ObservableEvent> }) => {
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
  const [model, chgModel] = useContext(ModelEditContext)!;

  useEffect(() => {
    setMainVideo(undefined)
    
    const {times, longestVideo} = calcMainVideo(layout, objTab)
    setVideoTimes(times)
    setMainVideo(longestVideo)
  }, [model])

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
          console.log(e.args.time, mainVideo, videoTimes[mainVideo!])
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

      const getComponent = (sender: Layout) => {
        let root = sender
        while (root.parent) {
          root = model.objTab[root.parent]
        }
        const { component, type } = model.timeNodes[root.id]?.data
        if (!component || !type) {
          return
        }
        return {component, type}
      }
      
      r
        .filter(e => e.layout === "Component" && e.event === "textEdit")
        .map(e => {
          chgModel(model => {
            const sender: Layout = model.objTab[e.sender]
            const component = getComponent(sender)
            if (!component) {
              return
            }
            const config = model.templateData.componentConfig[component.component]
            switch (component.type) {
              case "Branch":
              case "Check":
                if (sender.id.slice(config.prefix.length) in (config as BranchConfig | CheckConfig).videoText) {
                  (config as BranchConfig).videoText[sender.id.slice(config.prefix.length)].text = e.args.content
                }
                break
              case "Cycle":
                if (Number(sender.id.split("_")[1]) < (config as CycleConfig).videoText.length) {
                  (config as CycleConfig).videoText[Number(sender.id.split("_")[1])]!.text = e.args.content
                }
                break
            }
            sender.data.content = e.args.content
          })
        })

      r
        .filter(e => e.layout === "Component" && e.event === "videoUpload")
        .map(async (e) => {
          const file: File = e.args.file;
          const content = await file.arrayBuffer();
          await getWebDavInstance().uploadFile("/Videos/" + file.name, content);
          // const turl = URL.createObjectURL(file);
          const url = URIBase + "/Videos/" + file.name;

          chgModel(model => {
            const sender: Layout = model.objTab[e.sender]
            const component = getComponent(sender)
            if (!component) {
              return
            }
            const config = model.templateData.componentConfig[component.component]
            console.log(e)
            switch (component.type) {
              case "Branch":
              case "Check": {
                const name = sender.id.slice((config as BranchConfig | CheckConfig).prefix.length);
                (config as BranchConfig | CheckConfig).videos[name] = url;
                break
              }
              case "Cycle": {
                const idx = Number(sender.id.split("play")[1]);
                (config as CycleConfig).videos[idx] = {
                  url: url,
                  cover: "",
                }
                break
              }
            }
            sender.data.src = url
          })
        })

      r
        .filter(e => e.layout === "Component" && e.event === "onDurationChange")
        .map(e => {
          chgModel(model => {
            const sender: Layout = model.objTab[e.sender]
            sender.data.duration = e.args.duration
          })
        })
    },
    [events, mainVideo, model]
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
              state={{...playState, edit: true}}
            />
          </Box>
        </AspectRatio>
      </Box>
    </Stack>
  );
};
