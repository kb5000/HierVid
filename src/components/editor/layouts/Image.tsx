import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import { useCallback, useContext, useState } from "react"
import { ModelEditContext } from "../../../pages/flowPages/Detailed"
import { Layout } from "../../../schema/PlayModel"
import { ImageProps } from "../../player/layouts/Image"
import { Uploader } from "../../Uploader"
import { EditorArgs } from "../EditorWrapper"

export type { ImageProps } from "../../player/layouts/Image"

export const ImageEditor = (props: ImageProps & EditorArgs) => {
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
        component="img"
        src={props.data.src}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          ...props.data.sx,
        }}
      />
    </Box>
  )
}

export const ImagePropertyPage = (props: {
  layout: Layout
}) => {
  const [model, chgModel] = useContext(ModelEditContext)!;
  const data = props.layout.data as ImageProps["data"];
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
          const data: ImageProps["data"] = (
            model.objTab[props.layout.id] as Layout
          ).data;
          data.src = val;
        });
        break;
      case "jump":
        setClickTo(val)
        setJump(val)
        break
    }
  };

  return (
    <Stack spacing={1}>
      <Typography fontSize="1.3em">图片设置</Typography>
      <TextField
        variant="standard"
        label="点击跳转到"
        value={clickTo ?? ""}
        onChange={(val) => handleChange(val.target.value, "jump")}
      />
      <TextField
        variant="standard"
        label="图片地址"
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
          <Uploader />
        </Box>
      </Box>
    </Stack>
  );
}
