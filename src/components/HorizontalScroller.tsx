import { Box, SxProps, Theme } from "@mui/material";
import { forwardRef } from "react";
import { useEffect, WheelEvent } from "react";
import { useRef } from "react";

export const HorizontalScroller = forwardRef(
  (
    props: { children: any; speed?: number; sx?: SxProps<Theme>; onScrollLeftChanged?: (scrollLeft: number) => void },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const speed = props.speed ?? 100;

    const handleWheel = (e: any) => {
      if (boxRef.current) {
        boxRef.current.scrollLeft += e.deltaY > 0 ? speed : -speed;
        props.onScrollLeftChanged?.(boxRef.current.scrollLeft)

        e.stopPropagation();
        e.preventDefault();
      }
    };

    useEffect(() => {
      const ref = boxRef.current;

      ref?.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        ref?.removeEventListener("wheel", handleWheel);
      };
    }, [boxRef]);

    return (
      <Box
        sx={{
          ...props.sx,
          overflowY: "hidden",
          overflowX: "scroll",
          position: "relative",
        }}
        ref={(r: HTMLDivElement | null) => {
          boxRef.current = r;
          if (typeof ref === "function") {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}
      >
        {props.children}
      </Box>
    );
  }
);
