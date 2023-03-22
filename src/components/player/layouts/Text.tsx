import { Typography } from "@mui/material";
import { Observable } from "../../../tools/Reactive";
import { ObservableEvent } from "../../Player";
import { OnClickEvent } from "../events/Events";

export interface TextProps {
  id: string;
  reactive: Observable<ObservableEvent>
  objs: Record<string, any>;
  state: Record<string, any>;
  data: {
    content: string;
    sx: React.CSSProperties;
  };
}

export const Text = (props: TextProps) => {
  return (
    <Typography sx={props.data.sx} onClick={() => props.reactive.emit(new OnClickEvent(props.id, "Text"))}>
      {props.data.content}
    </Typography>
  );
};
