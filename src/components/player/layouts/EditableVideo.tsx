import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Observable, useObserve } from "../../../tools/Reactive";
import { ObservableEvent } from "../../Player";
import { Else, If } from "../../Vue";
import { VideoProps } from "./Video";
import addButtons from "../../../assets/img/addButton.svg";
import { Uploader } from "../../Uploader";

export const EditableVideo = (props: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   props.reactive.emit({
  //     sender: props.id,
  //     layout: "Video",
  //     event: "onClick",
  //     args: {},
  //   });
  // };

  const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // if (videoRef.current && props.data.play) {
    //   videoRef.current.play();
    // }
  };

  const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    props.reactive.emit({
      sender: props.id,
      layout: "Video",
      event: "onEnded",
      args: {},
    });
    e.stopPropagation();
  };

  const handleTimeUpdate = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    props.reactive.emit({
      sender: props.id,
      layout: "Video",
      event: "onTimeUpdate",
      args: {
        time: (e.target as HTMLVideoElement).currentTime,
      },
    });
  };

  const handleFileUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      props.reactive.emit({
        sender: props.id,
        layout: "Component",
        event: "videoUpload",
        args: {
          file: e.target.files[0]
        }
      })
    }
  };

  useObserve(
    props.reactive,
    (r) => {
      r.filter((e) => e.layout === "Player" && e.event === "setTime").map(
        (e) => {
          if (isFinite(e.args.time) && videoRef.current) {
            videoRef.current.currentTime = e.args.time;
          }
        }
      );
      r.filter((e) => e.layout === "Player" && e.event === "playState").map(
        (e) => {
          if (e.args.playing) {
            videoRef.current?.play();
          } else {
            videoRef.current?.pause();
          }
        }
      );
    },
    [props]
  );

  // 设置场景时间
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ondurationchange = (_) => {
        if (!videoRef.current) return;
        let duration = isNaN(videoRef.current.duration)
          ? 0
          : videoRef.current.duration;
        if (props.data.loop) {
          duration = Number.POSITIVE_INFINITY;
        }
        props.reactive.emit({
          sender: props.id,
          layout: "Video",
          event: "onDurationChange",
          args: { duration },
        });
      };
    }
  }, [props.id, props.reactive, props.data.loop]);

  useEffect(() => {
    const playHandler = (e: Event) => {
      if (!props.state.playing) {
        videoRef.current?.pause();
      }
    };

    videoRef.current?.addEventListener("play", playHandler);

    return () => {
      videoRef.current?.removeEventListener("play", playHandler);
    };
  }, [props.state.playing]);

  // 设置视频播放状态
  useEffect(() => {
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      if (props.state.playing) {
        videoRef.current.play();
      } else {
        videoRef.current.autoplay = false;
        videoRef.current.pause();
      }
    }
  }, [props.state.playing]);

  // 设置视频音量
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = props.data.volume / 100;
    }
  }, [props.data.volume]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <If v-if={Boolean(props.data.src)}>
        <Box
          component="video"
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            ...props.data.sx,
          }}
          src={props.data.src}
          loop={props.data.loop}
          ref={videoRef}
          onCanPlay={handleCanPlay}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
        />
        <Else>
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
        </Else>
      </If>
      <Uploader onChange={handleFileUploaded}/>
    </Box>
  );
};
