import { ComponentModel, Layout } from "../../schema/PlayModel";
import { Observable } from "../../tools/Reactive";
import { ObservableEvent } from "../Player";
import { HVStack, ZStack } from "./layouts/Stacks";
import { Text } from "./layouts/Text";
import { Video } from "./layouts/Video";
import { Image } from "./layouts/Image";
import { Web } from "./layouts/Web";
import { EditableText } from "./layouts/EditableText";
import { EditableVideo } from "./layouts/EditableVideo";

export type LayoutType = ( "HVStack" | "ZStack" | "Text" | "Video" | "Image" | "Web" )

export const LayoutWrapper = (props: {layout: Layout | ComponentModel, reactive: Observable<ObservableEvent>, objs: Record<string, any>, state: Record<string, any>}) => {
  if (props.layout.layoutType === "Layout") {
    switch (props.layout.type as LayoutType) {
      case "HVStack":
        return <HVStack id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
      case "ZStack":
        return <ZStack id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
      case "Text":
        return (props.state.edit
          ? <EditableText id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
          : <Text id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
        )
      case "Video":
        return (props.state.edit
          ? <EditableVideo id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
          : <Video id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
        )
      case "Image":
        return <Image id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
      case "Web":
        return <Web id={props.layout.id} data={props.layout.data} reactive={props.reactive} objs={props.objs} state={props.state} />
    }
  } else {
    return <>no matching layout</>
  }
}

