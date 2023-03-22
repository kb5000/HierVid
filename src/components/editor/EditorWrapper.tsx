import { Box } from "@mui/material"
import { useEffect, useState } from "react"
import { useImmer } from "use-immer"
import { v4 } from "uuid"
import { Layout, ComponentModel } from "../../schema/PlayModel"
import { Observable, useObserve } from "../../tools/Reactive"
import { ObservableEvent } from "../Player"
import { LayoutType } from "../player/LayoutWrapper"
import { ImageEditor } from "./layouts/Image"
import { HVStackEditor, HVStackProps, ZStackEditor, ZStackProps } from "./layouts/Stacks"
import { TextEditor, TextProps } from "./layouts/Text"
import { VideoEditor } from "./layouts/Video"

export type { LayoutType } from "../player/LayoutWrapper"

interface EditorArg {
  selected: boolean
}

export interface EditorArgs {
  editorArgs: EditorArg
}

export const EditorWrapper = (props: {layout: Layout, reactive: Observable<ObservableEvent>, objs: Record<string, any>, state: Record<string, any>}) => {
  const [editorArgs, chgEditorArgs] = useImmer<EditorArg>({
    selected: false
  })

  const handleOutboxClick = (e: any) => {
    props.reactive.emit({
      sender: props.layout.id,
      layout: props.layout.type,
      event: editorArgs.selected ? "unselect" : "select",
      args: {}
    })
  };

  useObserve(props.reactive, r => {
    r
      .filter(e => e.event === "select" || e.event === "unselect")
      .map(e => {
        chgEditorArgs(x => {
          x.selected = (e.sender === props.layout.id && e.event === "select")
        })
      })
  }, [])

  const inner = () => {
    const argObj = {
      id: props.layout.id,
      data: props.layout.data,
      reactive: props.reactive,
      objs: props.objs,
      editorArgs: editorArgs,
      state: props.state,
    }

    switch (props.layout.type as LayoutType) {
      case "HVStack":
        return <HVStackEditor {...argObj} />
      case "ZStack":
        return <ZStackEditor {...argObj} />
      case "Text":
        return <TextEditor {...argObj} />
      case "Video":
        return <VideoEditor {...argObj} />
      case "Image":
        return <ImageEditor {...argObj} />
      default:
        return <>no matching layout</>
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        p: "12px",
        background: "rgba(160, 160, 160, 0.15)",
        outline: editorArgs.selected ? "4px dashed #1976d2" : "inherit",
        cursor: "pointer",
      }}
      onClick={handleOutboxClick}
    >
      <Box
        sx={{ position: "relative", height: "100%", border: "1px solid black", cursor: "default" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {inner()}
      </Box>
    </Box>
  )
}

export const emptyLayout = (parent: string) => {
  return {
    id: v4(),
    type: "Text",
    layoutType: "Layout",
    parent,
    endTo: null,
    data: {
      content: "",
      sx: {},
    } as TextProps["data"]
  } as Layout
}

export const removeLayout = (layout: string, objTab: Record<string, any>) => {
  const root = objTab[layout] as Layout
  if (root.type === "HVStack" || root.type === "ZStack") {
    for (const i of (root.data as (HVStackProps["data"] | ZStackProps["data"])).children) {
      removeLayout(i.content, objTab)
    }
  }
  delete objTab[layout]
}

