import { Box, Input, Typography } from "@mui/material";
import { useState } from "react";
import { Observable } from "../../../tools/Reactive";
import { ObservableEvent } from "../../Player";
import { OnClickEvent } from "../events/Events";
import { TextProps } from "./Text";

export const EditableText = (props: TextProps) => {
  const [textBuf, setTextBuf] = useState(props.data.content);

  const handleTextChanged = (e: React.FocusEvent<HTMLInputElement>) => {
    props.reactive.emit({
      sender: props.id,
      layout: "Component",
      event: "textEdit",
      args: {
        content: e.target.value,
      }
    })
  }

  return (
    <Box
      sx={{
        border: "1px solid black",
      }}
    >
      <Input
        sx={{
          position: "relative",
          fontSize: "24pt",
          top: "8px",
          height: "80%",
          width: "100%",
          textAlign: "center",
          ...props.data.sx,
        }}
        value={textBuf}
        onChange={(e) => {
          setTextBuf(e.target.value);
        }}
        onBlur={handleTextChanged}
      />
    </Box>
  );
};
