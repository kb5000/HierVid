import { Box, MenuItem, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { ModelEditContext } from "../../../pages/flowPages/Detailed";
import { Layout } from "../../../schema/PlayModel";
import { HVStackProps, ZStackProps } from "../../player/layouts/Stacks";
import { ResizableBox } from "../../ResizableBox";
import { EditorArgs, EditorWrapper, emptyLayout, removeLayout } from "../EditorWrapper";

export type { HVStackProps, ZStackProps } from "../../player/layouts/Stacks";

export const HVStackEditor = (props: HVStackProps & EditorArgs) => {

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: props.data.vertical ? "column" : "row",
        '& :not(:last-child)': {
          borderRight: props.data.vertical ? undefined : `1px solid black`,
          borderBottom: props.data.vertical ? `1px solid black` : undefined,
        }
      }}
    >
      {props.data.children.map((x, idx) => {
        const child = props.objs[x.content] as Layout;

        return (
          <Box
            key={JSON.stringify(x)}
            sx={{
              position: "relative",
              // width: props.data.vertical ? "100%" : undefined,
              // height: props.data.vertical ? undefined : "100%",
              flex: x.space,
            }}
          >
            <EditorWrapper
              layout={child}
              reactive={props.reactive}
              objs={props.objs}
              state={props.state}
            />
          </Box>
        )
      })}
    </Box>
  )
};

export const ZStackEditor = (props: ZStackProps & EditorArgs) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [boxSize, setBoxSize] = useState({width: 200, height: 200})
  const [model, chgModel] = useContext(ModelEditContext)!

  const resetSize = () => {
    if (boxRef.current) {
      setBoxSize({
        width: boxRef.current.clientWidth,
        height: boxRef.current.clientHeight,
      })
    }
  }

  useEffect(() => {
    resetSize()
    window.addEventListener('resize', resetSize)

    return () => {
      window.removeEventListener('resize', resetSize)
    }
  }, [])

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
      ref={boxRef}
    >
      {props.data.children.map((x, idx) => {
        const child = props.objs[x.content] as Layout;
        
        const handleStateChanged = (state: {
          top: number;
          left: number;
          width: number;
          height: number;
        }) => {
          console.log(state)
          chgModel(draft => {
            const layout: Layout = draft.objTab[props.id]
            ;(layout.data as ZStackProps["data"]).children[idx].pos = {
              top: state.top * 100,
              left: state.left * 100,
              width: state.width * 100,
              height: state.height * 100,
            }
          })
        }

        return (
          <ResizableBox
            key={JSON.stringify([x, boxSize])}
            state={{
              width: x.pos.width / 100,
              height: x.pos.height / 100,
              top: x.pos.top / 100,
              left: x.pos.left / 100,
            }}
            bound={boxSize}
            onStateChanged={handleStateChanged}
          >
            <EditorWrapper
              layout={child}
              reactive={props.reactive}
              objs={props.objs}
              state={props.state}
            />
          </ResizableBox>
        );
      })}
    </Box>
  );
};

export const HVStackPropertyPage = (props: {
  layout: Layout
}) => {
  const [model, chgModel] = useContext(ModelEditContext)!
  const data = props.layout.data as (HVStackProps["data"])

  const handleChange = (val: string, entry: string) => {
    switch (entry) {
      case "entries":
        const num = Number.parseInt(val)
        const len = data.children.length
        if (num < len) {
          chgModel(model => {
            const data: HVStackProps["data"] = (model.objTab[props.layout.id] as Layout).data
            let toRemove = data.children.splice(num, len - num)
            toRemove.forEach(x => {
              removeLayout(x.content, model.objTab)
            })
          })
        } else if (num > len) {
          let toAdd: Layout[] = []
          for (let i = len; i < num; i++) {
            toAdd.push(emptyLayout(props.layout.id))
          }
          chgModel(model => {
            const data: HVStackProps["data"] = (model.objTab[props.layout.id] as Layout).data
            for (const i of toAdd) {
              data.children.push({
                space: 1,
                content: i.id
              })
            }
            for (const i of toAdd) {
              model.objTab[i.id] = i
            }
          })
        }
        break
      case "direction":
        chgModel(model => {
          const data: HVStackProps["data"] = (model.objTab[props.layout.id] as Layout).data
          data.vertical = (val === "true")
        })
        break
    }
  }

  return (
    <Stack spacing={1}>
      <Typography fontSize="1.3em">Split Setting</Typography>
      <TextField
        required
        variant="standard"
        label="Split Number"
        type="number"
        value={data.children.length}
        onChange={(val) => handleChange(val.target.value, "entries")}
      />
      <TextField
        required
        select
        variant="standard"
        label="Split Direction"
        value={data.vertical ? "true" : "false"}
        onChange={(val) => handleChange(val.target.value, "direction")}
      >
        <MenuItem key="0" value="false">Horizontal</MenuItem>
        <MenuItem key="1" value="true">Vertical</MenuItem>
      </TextField>
    </Stack>
  )
}

export const ZStackPropertyPage = (props: {
  layout: Layout
}) => {
  const [model, chgModel] = useContext(ModelEditContext)!
  const data = props.layout.data as (ZStackProps["data"])

  const handleChange = (val: string, entry: string) => {
    switch (entry) {
      case "entries":
        const num = Number.parseInt(val)
        const len = data.children.length
        if (num < len) {
          chgModel(model => {
            const data: ZStackProps["data"] = (model.objTab[props.layout.id] as Layout).data
            let toRemove = data.children.splice(num, len - num)
            toRemove.forEach(x => {
              removeLayout(x.content, model.objTab)
            })
          })
        } else if (num > len) {
          let toAdd: Layout[] = []
          for (let i = len; i < num; i++) {
            toAdd.push(emptyLayout(props.layout.id))
          }
          chgModel(model => {
            const data: ZStackProps["data"] = (model.objTab[props.layout.id] as Layout).data
            for (const i of toAdd) {
              data.children.push({
                pos: {
                  left: 0, top: 0, width: 20, height: 20
                },
                content: i.id
              })
            }
            for (const i of toAdd) {
              model.objTab[i.id] = i
            }
          })
        }
        break
    }
  }

  return (
    <Stack spacing={1}>
      <Typography fontSize="1.3em">Window Setting</Typography>
      <TextField
        required
        variant="standard"
        label="Window Number"
        type="number"
        value={data.children.length}
        onChange={(val) => handleChange(val.target.value, "entries")}
      />
    </Stack>
  )
}
