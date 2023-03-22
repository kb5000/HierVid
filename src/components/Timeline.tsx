import {
  closestCenter,
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { v4 } from "uuid";
import { VideoNode, VideoPort } from "../schema/Components";
import { ComponentModel, Layout, PlayModel, Scene } from "../schema/PlayModel";
import { drawCurveWithArrow } from "../tools/Curve";
import { Observable } from "../tools/Reactive";
import { HorizontalScroller } from "./HorizontalScroller";
import { ObservableEvent } from "./Player";
import { Else, If } from "./Vue";

const PortIcon = (props: {
  type: "out" | "in";
  state: "deactivated" | "activated";
  left: string;
  number?: number;
}) => {
  const theme = useTheme();

  return (
    <If v-if={props.type === "in"}>
      <Box
        sx={{
          position: "absolute",
          width: "8px",
          height: "8px",
          background:
            props.state === "activated"
              ? theme.palette.primary.main
              : theme.palette.grey[400],
          top: "37px",
          left: props.left,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "8px",
          height: "8px",
          background:
            props.state === "activated"
              ? theme.palette.primary.main
              : theme.palette.grey[400],
          borderRadius: "4px",
          top: "33px",
          left: props.left,
        }}
      />
      <Else>
        <Box
          sx={{
            position: "absolute",
            width: "16px",
            height: "16px",
            background:
              props.state === "activated"
                ? theme.palette.primary.main
                : theme.palette.grey[400],
            borderRadius: "8px",
            top: "19px",
            left: props.left,
          }}
        >
          <Typography
            sx={{
              position: "relative",
              fontSize: "12px",
              fontWeight: "bold",
              left: "4.5px",
              top: "-1px",
              color: "white",
            }}
          >
            {props.number}
          </Typography>
        </Box>
      </Else>
    </If>
  );
};

const TimeNode = (props: {
  folded?: boolean;
  highlight?: boolean;
  width: number;
  idx: number;
  id: string;
  onMouseDown: (e: any) => any;
}) => {
  const theme = useTheme();
  const idRef = useRef(props.id);
  const droppable = useDroppable({
    id: idRef.current,
    data: {
      type: "node",
      index: props.idx,
    },
  });
  const sortable = useSortable({
    id: idRef.current,
    data: {
      type: "node",
      supports: ["node"],
    },
  });

  return (
    <Box
      ref={sortable.setNodeRef}
      style={{
        position: "relative",
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        zIndex: sortable.isDragging ? "300" : "auto",
        opacity: sortable.isDragging ? 0.3 : 1,
      }}
      {...sortable.listeners}
      {...sortable.attributes}
      onMouseDown={(e: any) => {
        sortable.listeners?.onMouseDown(e)
        props.onMouseDown(e)
      }}
    >
      <If v-if={props.folded ?? false}>
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: "-4px",
            left: "-4px",
            border: `1px solid ${theme.palette.divider}`,
            zIndex: 100,
            background: theme.palette.common.white,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: "-2px",
            left: "-2px",
            border: `1px solid ${theme.palette.divider}`,
            zIndex: 100,
            background: theme.palette.common.white,
          }}
        />
      </If>
      <Box
        sx={{
          position: "relative",
          height: "90px",
          width: `${props.width}px`,
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          flexGrow: 0,
          display: "flex",
          alignItems: "center",
          zIndex: 200,
          background: props.highlight
            ? "#1976d20c"
            : theme.palette.common.white,
        }}
        ref={droppable.setNodeRef}
      >
        <Box
          component="img"
          src={process.env.PUBLIC_URL + "/img/Group 38.png"}
          sx={{ width: "100%", height: "50px", objectFit: "cover" }}
          draggable={false}
        />
      </Box>
    </Box>
  );
};

const TimeSlider = forwardRef(
  (props: { left?: number, scrollLeft?: number }, ref: React.ForwardedRef<HTMLDivElement>) => {
    const theme = useTheme();
    const draggable = useDraggable({
      id: "timeSlider",
      data: {
        supports: ["node"],
      },
    });

    return (
      <Box
        sx={{
          position: "absolute",
          height: "108px",
          width: "10px",
          left: `${props.left ?? 100}px`,
          top: "36px",
          zIndex: "600",
          cursor: "pointer",
        }}
        ref={(r: HTMLDivElement | null) => {
          draggable.setNodeRef(r);
          if (typeof ref === "function") {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}
        style={{
          transform: draggable.transform
            ? `translate3d(${draggable.transform.x + (props?.scrollLeft ?? 0)}px, 0, 0)`
            : undefined,
        }}
        {...draggable.listeners}
        {...draggable.attributes}
      >
        <Box
          sx={{
            position: "relative",
            width: "4px",
            left: "3px",
            height: "100%",
            background: theme.palette.primary.main,
            borderRadius: "4px",
          }}
        />
      </Box>
    );
  }
);

const TimeNodeSpace = (props: { idx: number }) => {
  const idRef = useRef(v4());
  const droppable = useDroppable({
    id: idRef.current,
    data: {
      type: "space",
      index: props.idx,
    },
  });

  return (
    <Box
      sx={{
        position: "relative",
        width: "8px",
        height: "90px",
        cursor: "pointer",
      }}
      ref={droppable.setNodeRef}
    ></Box>
  );
};

const TimeNodeBackground = ({left, width, type}: { left: number, width: number, type: "Sequential" | "Parallel" }) => {
  return (
    <Box sx={{
      position: "absolute",
      width: `${width}px`,
      height: "102px", 
      border: "1px solid rgb(224, 224, 224)",
      top: "40px",
      left: `${left}px`,
      // background: `${type === "Sequential" ? 'rgba(25, 118, 210, 0.05)' : 'rgba(230, 219, 116, 0.15)'}`
      background: `${type === "Sequential" ? 'rgba(25, 118, 210, 0.35)' : 'rgba(230, 219, 116, 0.55)'}`
    }} />
  )
}

const sTimeNodes = [
  { id: "1", highlight: false, folded: false, width: 144, ports: [{outId: "3", time: 1, outTime: 0}], data: {} },
  { id: "2", highlight: true, folded: false, width: 144, ports: [{outId: "3", time: 0, outTime: 0},{outId: "5", time: 0.3, outTime: 0}], data: {} },
  { id: "3", highlight: false, folded: true, width: 288, ports: [], data: {} },
  { id: "4", highlight: false, folded: false, width: 144, ports: [], data: {} },
  { id: "5", highlight: false, folded: false, width: 144, ports: [], data: {} },
  { id: "6", highlight: false, folded: false, width: 144, ports: [], data: {} },
  { id: "7", highlight: false, folded: false, width: 144, ports: [], data: {} },
  { id: "8", highlight: false, folded: false, width: 144, ports: [], data: {} },
  { id: "9", highlight: false, folded: false, width: 144, ports: [], data: {} },
];

interface VideoPortDisplay {
  type:"in" | "out"
  state: "activated" | "deactivated"
  left: string
  number: number
}

type StateTreeNode = {node: Layout | ComponentModel, children: StateTreeNode[], expanded: boolean}

export const Timeline = (props: { data: PlayModel, timeReactive?: Observable<ObservableEvent> }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeNodeBoxRef = useRef<HTMLDivElement | null>(null);
  const timeAreaRef = useRef<HTMLDivElement | null>(null);

  const [canvasWidth, setCanvasWidth] = useState<number | undefined>();
  const [globalTime, setGlobalTime] = useState<[number, number]>([0, 0.5]);
  const [timeSliderPos, setTimeSliderPos] = useState(0);
  const [nodeDragging, setNodeDragging] = useState<any>(null);
  const [timeNodes, setTimeNodes] = useState<VideoNode[]>(sTimeNodes);
  const [nodePorts, setNodePorts] = useState<VideoPortDisplay[]>([])
  const [stateTree, chgStateTree] = useImmer<StateTreeNode[]>([])

  const theme = useTheme();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // tools
  const setTimePosByMouseX = (sliderPos: number) => {
    let accPos = 16 - 5;
    let gTime: [number, number] = [0, 0];
    for (let i = 0; accPos < sliderPos && i < timeNodes.length; i++) {
      if (accPos + timeNodes[i].width >= sliderPos) {
        gTime[1] = (sliderPos - accPos) / timeNodes[i].width;
        break;
      }
      accPos += timeNodes[i].width + 8;
      if (i === timeNodes.length - 1) {
        gTime[1] = 1;
      } else {
        gTime[0]++;
      }
    }
    setTimeSliderPos(sliderPos);
    setGlobalTime(gTime);
  };

  // events
  const handleDragStart = (event: DragStartEvent) => {
    console.log(event);
    const { active } = event;
    if (active.data.current!.type === "node") {
      setNodeDragging(timeNodes.find((x) => x.id === active.id));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event);
    const { active, over, delta } = event;
    if (!over) return;
    if (active.id === "timeSlider") {
      let sliderPos = timeSliderPos + delta.x;
      setTimePosByMouseX(sliderPos);
    }
    if (active.data.current?.type === "node") {
      setNodeDragging(null);

      if (active.id !== over.id) {
        setTimeNodes((items) => {
          const oldIndex = items.findIndex((x) => x.id === active.id);
          const newIndex = items.findIndex((x) => x.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleStackClick = (e: any) => {
    let pos = e.clientX - 240 + timeAreaRef.current!.scrollLeft;
    setTimePosByMouseX(pos - 5);
  };

  // useEffect(() => {
  //   const newTimeNodes = []
  //   let depth = 0
  //   const firstStack: [ComponentModel, number][] = []
  //   const rootComponent = props.data.objTab[(props.data.objTab[props.data.root] as Scene).rootComponent] as ComponentModel
    
  //   const addGroup = (root: ComponentModel) => {
  //     for (let i of root.children) {
  //       if (i.type === "Layout") {
  //         // firstStack
  //       }
  //     }
  //   }

  // }, [props.data])

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.scrollWidth;
      canvasRef.current.height = canvasRef.current.scrollHeight;

      const ctx = canvasRef.current.getContext("2d");

      const outPortList: VideoPortDisplay[] = []
      const inPortList: any[] = []
      let left = 16
      const idToPos: {[x: string]: [number, number]} = {}

      for (let i of timeNodes) {
        idToPos[i.id] = [left, i.width]
        left += i.width + 8
      }

      const clearNodeBuf = (nodeBuf: VideoPort[], i: VideoNode) => {
        if (nodeBuf.length === 0) return
        const rep = nodeBuf[0]
        let pos = left + rep.time * (i.width - 16)
        for (let j of nodeBuf) {
          let left = idToPos[j.outId][0] + j.outTime * (idToPos[j.outId][1] - 16)
          inPortList.push({
            type: "in",
            state: i.highlight ? "activated" : "deactivated",
            left,
            number: 1,
          })
          drawCurveWithArrow({
            ctx: ctx!,
            from: [pos, 28],
            to: [left + (pos > left ? 8 : 0), 38],
            color: i.highlight ? theme.palette.primary.main : theme.palette.grey[400],
          });
        }
        outPortList.push({
          type: "out",
          state: i.highlight ? "activated" : "deactivated",
          left: pos + 'px',
          number: nodeBuf.length
        })
      }

      left = 16;
      for (let i of timeNodes) {
        const nodeBuf: VideoPort[] = []
        for (let j of i.ports.sort((a, b) => a.time - b.time)) {
          if (nodeBuf.length === 0 || nodeBuf[nodeBuf.length - 1].time !== j.time) {
            nodeBuf.push(j)
          } else {
            clearNodeBuf(nodeBuf, i)
          }
        }
        clearNodeBuf(nodeBuf, i)
        left += i.width + 8
      }
      
      const newNodePorts = inPortList.concat(outPortList)
      setNodePorts(newNodePorts)
    }
  }, [canvasRef.current, timeNodes]);

  useEffect(() => {
    if (timeNodeBoxRef.current) {
      setCanvasWidth(timeNodeBoxRef.current.scrollWidth);
    }
  }, [timeNodeBoxRef.current]);

  useEffect(() => {
    let left = 16 - 5;
    for (let i = 0; i < globalTime[0]; i++) {
      left += timeNodes[i].width + 8;
    }
    left += timeNodes[globalTime[0]].width * globalTime[1];
    setTimeSliderPos(left);
  }, [globalTime]);

  return (
    <HorizontalScroller sx={{ height: "100%" }} ref={timeAreaRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ position: "relative", height: "100%", userSelect: "none" }}>
          <Box
            ref={canvasRef}
            component="canvas"
            sx={{
              position: "relative",
              width: canvasWidth ?? "100%",
              height: "100%",
              zIndex: 150,
              visibility: nodeDragging ? "hidden" : "visible",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              zIndex: 150,
              top: 0,
              left: 0,
              visibility: nodeDragging ? "hidden" : "visible",
            }}
          >
            {nodePorts.map((x, idx) => <PortIcon key={x.left + idx} {...x} />)}
          </Box>
          <Box
            ref={timeNodeBoxRef}
            sx={{
              position: "absolute",
              height: "100%",
              top: 0,
              left: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box sx={{position: "absolute", height: "100%", width: "100%"}}>
              <TimeNodeBackground left={12} width={304} type="Sequential" />
              {/* <TimeNodeBackground left={315} width={601} type="Sequential" /> */}
              <TimeNodeBackground left={612} width={304} type="Parallel" />
            </Box>
            <Stack
              direction="row"
              spacing={0}
              px={1}
              sx={{
                cursor: "grab",
              }}
            >
              <SortableContext
                items={timeNodes}
                strategy={horizontalListSortingStrategy}
              >
                <TimeNodeSpace key={"s-1"} idx={-1} />
                {timeNodes.map((x, idx) => (
                  <React.Fragment key={x.id}>
                    <TimeNode
                      key={x.id}
                      idx={idx}
                      {...x}
                      onMouseDown={handleStackClick}
                    />
                    <TimeNodeSpace key={"t" + x.id} idx={idx} />
                  </React.Fragment>
                ))}
                <DragOverlay>
                  {nodeDragging ? (
                    <Box sx={{cursor: "grabbing"}}><TimeNode
                      idx={-1}
                      id={""}
                      {...nodeDragging}
                    /></Box>
                  ) : null}
                </DragOverlay>
              </SortableContext>
            </Stack>
          </Box>
          <TimeSlider left={timeSliderPos} />
        </Box>
      </DndContext>
    </HorizontalScroller>
  );
};
