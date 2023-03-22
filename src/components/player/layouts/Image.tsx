import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { Observable } from "../../../tools/Reactive";
import { ObservableEvent } from "../../Player";
import { OnClickEvent } from "../events/Events";

export interface ImageProps {
  id: string;
  reactive: Observable<ObservableEvent>
  objs: Record<string, any>;
  state: Record<string, any>;
  data: {
    src: string;
    sx: React.CSSProperties;
  };
}

export const Image = (props: ImageProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.reactive.emit(new OnClickEvent(props.id, "Image"))
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      onClick={handleClick}
    >
      <Box
        component="img"
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          ...props.data.sx,
        }}
        src={props.data.src}
      />
    </Box>
  );
};
