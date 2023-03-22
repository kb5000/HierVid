import { Box } from "@mui/material";
import { Layout } from "../../../schema/PlayModel";
import { Observable } from "../../../tools/Reactive";
import { ObservableEvent } from "../../Player";
import { LayoutWrapper } from "../LayoutWrapper";

export interface HVStackProps {
  id: string;
  reactive: Observable<ObservableEvent>;
  data: {
    children: { space: number, content: string }[];
    vertical: boolean;
  };
  objs: Record<string, any>;
  state: Record<string, any>;
}

export const HVStack = (props: HVStackProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: props.data.vertical ? "column" : "row",
      }}
    >
      {props.data.children.map(({space, content: childName}) => {
        const child = props.objs[childName] as Layout;
        return (
          <Box
            key={child.id}
            sx={{
              position: "relative",
              flex: space,
            }}
          >
            <LayoutWrapper
              layout={child}
              reactive={props.reactive}
              objs={props.objs}
              state={props.state}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export interface ZStackProps {
  id: string;
  reactive: Observable<ObservableEvent>;
  objs: Record<string, any>;
  state: Record<string, any>;
  data: {
    children: {
      pos: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
      content: string;
    }[];
  };
}

export const ZStack = (props: ZStackProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {props.data.children.map((x) => {
        const child = props.objs[x.content] as Layout;
        return (
          <Box
            key={child.id}
            sx={{
              position: "absolute",
              width: `${x.pos.width}%`,
              height: `${x.pos.height}%`,
              top: `${x.pos.top}%`,
              left: `${x.pos.left}%`,
            }}
          >
            <LayoutWrapper
              layout={child}
              reactive={props.reactive}
              objs={props.objs}
              state={props.state}
            />
          </Box>
        );
      })}
    </Box>
  );
};
