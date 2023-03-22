import { Stack, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ModelEditContext } from "../../../pages/flowPages/Detailed";
import { Layout } from "../../../schema/PlayModel";
import { TextProps } from "../../player/layouts/Text"
import { EditorArgs } from "../EditorWrapper"

export type { TextProps } from "../../player/layouts/Text"

export const TextEditor = (props: TextProps & EditorArgs) => {

  return (
    <Typography sx={props.data.sx}>
      {props.data.content}
    </Typography>
  );
}

export const TextPropertyPage = (props: {
  layout: Layout
}) => {
  const [model, chgModel] = useContext(ModelEditContext)!
  const data = props.layout.data as (TextProps["data"])
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
        console.log(rootLayout)
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
      case "text":
        chgModel(model => {
          const data: TextProps["data"] = (model.objTab[props.layout.id] as Layout).data
          data.content = val
        })
        break
      case "jump":
        setClickTo(val)
        setJump(val)
        break
    }
  }

  useEffect(() => {
    setClickTo(model.events
      .filter(x => x.sender === props.layout.id && x.event === "onClick")
      .map(x => x.args.target as string)?.[0])
  }, [model, props.layout.id])

  return (
    <Stack spacing={1}>
      <Typography fontSize="1.3em">文本设置</Typography>
      <TextField
        variant="standard"
        label="点击跳转到"
        value={clickTo ?? ""}
        onChange={(val) => handleChange(val.target.value, "jump")}
      />
      <TextField
        variant="standard"
        label="文字内容"
        value={data.content}
        onChange={(val) => handleChange(val.target.value, "text")}
      />
    </Stack>
  )
}
