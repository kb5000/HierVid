import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { ModelEditContext } from "../../../pages/flowPages/Detailed";
import { Layout } from "../../../schema/PlayModel";
import { getWebDavInstance, URIBase } from "../../../tools/Backend";
import { VideoProps } from "../../player/layouts/Video";
import { Uploader } from "../../Uploader";
import { EditorArgs } from "../EditorWrapper";

export type { VideoProps } from "../../player/layouts/Video";

export const VideoEditor = (props: VideoProps & EditorArgs) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, chgModel] = useContext(ModelEditContext)!;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ondurationchange = (_) => {
        if (!videoRef.current) return;
        let duration = isNaN(videoRef.current.duration) ? 0 : videoRef.current.duration
        if (props.data.loop) {
          duration = Number.POSITIVE_INFINITY
        }
        chgModel(model => {
          const data: VideoProps["data"] = (
            model.objTab[props.id] as Layout
          ).data;
          data.length = duration;
        })
      }
    }
  }, [props.id, props.reactive, props.data.loop])

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
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
      />
    </Box>
  );
};

export const VideoPropertyPage = (props: { layout: Layout }) => {
  const [model, chgModel] = useContext(ModelEditContext)!;
  const data = props.layout.data as VideoProps["data"];
  const fileRef = useRef<HTMLInputElement>(null)
  const [clickTo, setClickTo] = useState<string | undefined>(model.events
    .filter(x => x.sender === props.layout.id && x.event === "onClick")
    .map(x => x.args.target as string)?.[0])
  const setJump = (val: string) => {
    chgModel(model => {
      const pos = model.events
        .findIndex(x => x.sender === props.layout.id && x.event === "onClick")
      const tval = val.trim()
      console.log(tval, pos)
      let rootLayout = props.layout.id;
      while (!(rootLayout in model.timeNodes)) {
        rootLayout = (model.objTab[rootLayout] as Layout).parent!
      }
      if (pos !== -1) {
        const portPos = model.timeNodes[rootLayout].ports.findIndex(x => x.target === model.events[pos].args.target)
        if (tval === "") {
          model.events.splice(pos, 1)
          model.timeNodes[rootLayout].ports.splice(portPos, 1)
        } else {
          model.events[pos].action = "jump"
          model.events[pos].args = { target: tval }
          model.timeNodes[rootLayout].ports[portPos] = {
            fromTime: 1,
            toTime: 0,
            target: tval,
          }
        }
      } else if (pos === -1 && tval !== "") {
        model.events.push({
          sender: props.layout.id,
          event: "onClick",
          action: "jump",
          args: { target: tval },
        })
        model.timeNodes[rootLayout].ports.push({
          fromTime: 1,
          toTime: 0,
          target: tval,
        })
      }
    })
  }

  const handleChange = (val: string, entry: string) => {
    switch (entry) {
      case "src":
        chgModel((model) => {
          const data: VideoProps["data"] = (
            model.objTab[props.layout.id] as Layout
          ).data;
          data.src = val;
        });
        break;
      case "loop":
        chgModel(model => {
          const data: VideoProps["data"] = (
            model.objTab[props.layout.id] as Layout
          ).data;
          data.loop = val !== "false"
        });
        break
      case "jump":
        setClickTo(val)
        setJump(val)
        break
    }
  };

  const handleUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fileRef.current) {
      return
    }
    console.log("uploading")
    if (fileRef.current.files?.length) {
      const file = fileRef.current.files[0]
      const webdav = getWebDavInstance()
      const id = v4()
      const path ="/asset/" + id + ".mp4"
      webdav.uploadFile(path, file)
        .then(res => {
          chgModel(model => {
            const data: VideoProps["data"] = (
              model.objTab[props.layout.id] as Layout
            ).data;
            data.src = URIBase + path
          })
        })
        .catch(err => {
          console.error(err)
        })
    }
  }

  return (
    <Stack spacing={1}>
      <Typography fontSize="1.3em">视频设置</Typography>
      <TextField
        variant="standard"
        label="点击跳转到"
        value={clickTo ?? ""}
        onChange={(val) => handleChange(val.target.value, "jump")}
      />
      <TextField
        variant="standard"
        label="视频地址"
        value={data.src}
        onChange={(val) => handleChange(val.target.value, "src")}
      />
      <Box sx={{width: 60, height: 30.75}}>
        <Box
          sx={{
            position: "absolute",
          }}
        >
          <Button variant="contained" size="small">上传</Button>
          <Uploader ref={fileRef} onChange={handleUploadClick} />
        </Box>
      </Box>
      <TextField
        required
        select
        variant="standard"
        label="视频循环"
        value={data.loop ? "true" : "false"}
        onChange={(val) => handleChange(val.target.value, "loop")}
      >
        <MenuItem key="0" value="false">不循环</MenuItem>
        <MenuItem key="1" value="true">无限循环</MenuItem>
      </TextField>
    </Stack>
  );
};
