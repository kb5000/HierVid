import { Box, BoxProps } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Position, SizeObject } from "../tools/Interfaces";

const bounded = (num: number, min: number, max: number) => (
  Math.min(max, Math.max(min, num))
)

export const ResizableBox = (props: {
  state?: Position;
  bound: SizeObject;
  inner?: BoxProps;
  onStateChanged?: (x: Position) => void;
  children?: any;
}) => {
  const [state, setState] = useState<[number, number, number, number]>(
    props.state
      ? [
          props.state.top * props.bound.height,
          props.state.left * props.bound.width,
          props.state.width * props.bound.width,
          props.state.height * props.bound.height,
        ]
      : [0, 0, props.bound.width, props.bound.height]
  );
  const [initState, setInitState] = useState(state);
  const [currentMove, setCurrentMove] = useState<string | null>(null);
  const [initPos, setInitPos] = useState<[number, number]>([0, 0]);
  const stateRef = useRef<typeof state>(state)

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    t: string
  ) => {
    setInitPos([e.screenX, e.screenY]);
    setInitState(state);
    setCurrentMove(t);
  };

  const notifyState = (newState: typeof state) => {
    stateRef.current = newState
    setState(newState);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    switch (currentMove) {
      case "ns":
        notifyState([
          initState[0],
          initState[1],
          initState[2],
          bounded(initState[3] + (e.screenY - initPos[1]), 1, props.bound.height - initState[1]),
        ]);
        break;
      case "ew":
        notifyState([
          initState[0],
          initState[1],
          bounded(initState[2] + (e.screenX - initPos[0]), 1, props.bound.width - initState[0]),
          initState[3],
        ]);
        break;
      case "nwse":
        notifyState([
          initState[0],
          initState[1],
          bounded(initState[2] + (e.screenX - initPos[0]), 1, props.bound.width - initState[0]),
          bounded(initState[3] + (e.screenY - initPos[1]), 1, props.bound.height - initState[1]),
        ]);
        break;
      case "move":
        notifyState([
          bounded(initState[0] + (e.screenY - initPos[1]), 0, props.bound.height - initState[3]),
          bounded(initState[1] + (e.screenX - initPos[0]), 0, props.bound.width - initState[2]),
          initState[2],
          initState[3],
        ]);
        break;
    }
  };

  const handleGlobalMouseUp = (e: MouseEvent) => {
    setCurrentMove(null);

    props.onStateChanged?.({
      top: stateRef.current[0] / props.bound.height,
      left: stateRef.current[1] / props.bound.width,
      width: stateRef.current[2] / props.bound.width,
      height: stateRef.current[3] / props.bound.height,
    });
  };

  useEffect(() => {
    if (currentMove) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [currentMove]);

  return (
    <Box
      sx={{
        position: "absolute",
        // transform: `translate(${state[0]}px, ${state[1]}px)`,
        left: state[1],
        top: state[0],
      }}
    >
      <Box
        sx={{
          position: "absolute",
          // background: "yellow",
          top: 0,
          left: 0,
          width: state[2],
          height: "8px",
          cursor: "move",
          userSelect: "none",
        }}
        onMouseDown={(e) => handleMouseDown(e, "move")}
      />
      <Box
        sx={{
          position: "absolute",
          // background: "black",
          top: state[3],
          left: 0,
          width: state[2],
          height: "8px",
          cursor: "ns-resize",
          userSelect: "none",
        }}
        onMouseDown={(e) => handleMouseDown(e, "ns")}
      />
      <Box
        sx={{
          position: "absolute",
          // background: "green",
          top: 0,
          left: state[2],
          height: state[3],
          width: "8px",
          cursor: "ew-resize",
          userSelect: "none",
        }}
        onMouseDown={(e) => handleMouseDown(e, "ew")}
      />
      <Box
        sx={{
          position: "absolute",
          // background: "red",
          top: state[3] - 4,
          left: state[2] - 4,
          height: "8px",
          width: "8px",
          cursor: "nwse-resize",
          userSelect: "none",
        }}
        onMouseDown={(e) => handleMouseDown(e, "nwse")}
      />
      <Box
        {...props.inner}
        sx={{ border: "1px solid black", width: state[2], height: state[3] }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
