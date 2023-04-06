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
import {
  AccountTree,
  Add,
  ArrowUpward,
  ContentCopy,
  ContentCut,
  ContentPaste,
  Delete,
  DeleteOutline,
  HighlightAlt,
  LinearScale,
  Merge,
  MoveDown,
  NearMe,
  OpenWith,
  PanTool,
  PanToolAlt,
  Schema,
  TouchApp,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import { v4 } from "uuid";
import { ModelEditContext } from "../pages/flowPages/Detailed";
import {
  PortData,
  TimeNodeData,
  VideoNode,
  VideoPort,
} from "../schema/Components";
import {
  ComponentModel,
  Layout,
  pickFirst2,
  PlayModel,
  Scene,
} from "../schema/PlayModel";
import { getVideoCover } from "../tools/Backend";
import { drawCurveWithArrow } from "../tools/Curve";
import { Observable, useObserve, useReactive } from "../tools/Reactive";
import { HorizontalScroller } from "./HorizontalScroller";
import { calcMainVideo, ObservableEvent } from "./Player";
import { Else, If } from "./Vue";

type ToolType = "cursor" | "move" | "merge";

const PortIcon = (props: {
  type: "out" | "in";
  state: "deactivated" | "activated";
  left: number;
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
          top: "64px",
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
          top: "60px",
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
            top: "48px",
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

const InnerTimeNode = (props: {
  folded: boolean;
  highlight: "none" | "ser" | "par";
  width?: number;
  idx: number;
  id: string;
  tool: ToolType;
  img?: string | null;
}) => {
  const theme = useTheme();
  const droppable = useDroppable({
    id:
      props.id +
      (props.tool === "cursor" ? "[C]" : props.tool === "merge" ? "[D]" : ""),
    data: {
      type: "node",
      index: props.idx,
      nId: props.id,
    },
  });
  const [isOver, setIsOver] = useState(droppable.isOver);

  useEffect(() => {
    if (props.tool === "merge") {
      setIsOver(
        droppable.isOver && droppable.active?.data.current?.nId !== props.id
      );
    }
  }, [droppable.isOver, droppable.active, props.id, props.tool]);

  return (
    <>
      <If v-if={props.folded}>
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: "-4px",
            left: "-4px",
            border: `1px solid ${theme.palette.divider}`,
            zIndex: 100,
            background: "none",
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
            background: "none",
          }}
        />
      </If>
      <Box
        sx={{
          position: "relative",
          height: "90px",
          width: props.width ?? 144,
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          flexGrow: 0,
          display: "flex",
          alignItems: "center",
          zIndex: 200,
          background:
            props.highlight === "none"
              ? theme.palette.common.white
              : props.highlight === "par"
              ? "#f7f2c8"
              : "#e3eefa",
          outline: isOver ? `2px dashed #1976d2` : "none",
          outlineOffset: "4px",
        }}
        ref={droppable.setNodeRef}
      >
        <Box
          component="img"
          src={props.img ?? process.env.PUBLIC_URL + "/img/Group 38.png"}
          sx={{ width: "100%", height: "50px", objectFit: "cover" }}
          draggable={false}
        />
      </Box>
    </>
  );
};

const TimeNode = (props: {
  folded: boolean;
  highlight: "none" | "ser" | "par";
  width?: number;
  idx: number;
  id: string;
  onActive?: (e: any) => any;
  onOpen?: (e: any) => any;
  tool: ToolType;
  grabbing?: boolean;
  img?: string | null;
}) => {
  const sortable = useSortable({
    id: props.id,
    data: {
      type: "node",
      supports: ["node"],
      nId: props.id,
    },
  });
  const draggable = useDraggable({
    id: props.id + "[D]",
    data: {
      supports: ["node"],
      type: "node",
      nId: props.id,
    },
  });

  if (props.tool === "move") {
    return (
      <Box
        ref={sortable.setNodeRef}
        style={{
          position: "relative",
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
          zIndex: sortable.isDragging ? "300" : "auto",
          opacity: sortable.isDragging ? 0.3 : 1,
          cursor: props.grabbing ? "grabbing" : "grab",
        }}
        {...sortable.listeners}
        {...sortable.attributes}
      >
        <InnerTimeNode {...props} />
      </Box>
    );
  } else if (
    props.tool === "cursor" ||
    (props.tool === "merge" && props.folded)
  ) {
    return (
      <Box
        sx={{
          position: "relative",
          cursor: "pointer",
        }}
        onClick={props.onActive}
        onDoubleClick={props.onOpen}
      >
        <InnerTimeNode {...props} />
      </Box>
    );
  } else {
    return (
      <Box
        ref={draggable.setNodeRef}
        style={{
          position: "relative",
          transform: draggable.isDragging
            ? `translate3d(${draggable.transform!.x}px, ${
                draggable.transform!.y
              }px, 0)`
            : "none",
          zIndex: draggable.isDragging ? "300" : "auto",
          cursor: draggable.isDragging ? "grabbing" : "grab",
        }}
        {...draggable.listeners}
        {...draggable.attributes}
      >
        <InnerTimeNode {...props} />
      </Box>
    );
  }
};

const TimeSlider = forwardRef(
  (
    props: { left?: number; scrollLeft?: number },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const theme = useTheme();
    const draggable = useDraggable({
      id: "timeSlider",
      data: {
        supports: ["node"],
        type: "slider",
      },
    });

    return (
      <Box
        sx={{
          position: "absolute",
          height: "108px",
          width: "10px",
          left: `${props.left ?? 100}px`,
          top: "64px",
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
            ? `translate3d(${
                draggable.transform.x + (props?.scrollLeft ?? 0)
              }px, 0, 0)`
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

const TimeNodeSpace = (props: {
  idx: number;
  width: number;
  tool: ToolType;
}) => {
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
        width: props.width,
        height: "90px",
        cursor: props.tool === "cursor" ? "pointer" : "default",
      }}
      ref={droppable.setNodeRef}
    ></Box>
  );
};

const TimeNodeBackground = ({
  left,
  width,
  type,
}: {
  left: number;
  width: number;
  type: "Sequential" | "Parallel";
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        width: `${width}px`,
        height: "102px",
        border: "1px solid rgb(224, 224, 224)",
        top: "40px",
        left: `${left}px`,
        // background: `${type === "Sequential" ? 'rgba(25, 118, 210, 0.05)' : 'rgba(230, 219, 116, 0.15)'}`
        background: `${
          type === "Sequential"
            ? "rgba(25, 118, 210, 0.35)"
            : "rgba(230, 219, 116, 0.55)"
        }`,
      }}
    />
  );
};

export const getVideoLayout = async (
  root: string,
  objs: Record<string, any>
) => {
  if (!(root in objs)) {
    return null;
  }
  const mainVideo = calcMainVideo(objs[root], objs);
  if (mainVideo.longestVideo) {
    const {cover} = await getVideoCover(objs[mainVideo.longestVideo].data.src);
    return cover;
  } else {
    return null;
  }
};

interface VideoPortDisplay {
  type: "in" | "out";
  state: "activated" | "deactivated";
  left: number;
  number: number;
}

type StateTreeNode = {
  node: Layout | ComponentModel;
  children: StateTreeNode[];
  expanded: boolean;
};

export const Timeline2 = (props: {
  data: PlayModel;
  timeReactive: Observable<ObservableEvent>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeNodeBoxRef = useRef<HTMLDivElement | null>(null);
  const timeAreaRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const theme = useTheme();

  const [toolState, setToolState] = useState<ToolType>("cursor");
  const [nodeDragging, setNodeDragging] = useState<any>(null);
  const [currentLayer, setCurrentLayer] = useState<string | null>(null);
  const [model, chgModel] = useContext(ModelEditContext)!;
  const timeNodes = {
    objs: model.timeNodes,
    arrs: model.timeArrs,
  };
  const chgTimeNodes = (
    func: (draft: typeof timeNodes, modelDraft?: PlayModel) => void
  ) => {
    chgModel((draft) => {
      func(
        {
          objs: draft.timeNodes,
          arrs: draft.timeArrs,
        },
        draft
      );
    });
  };
  const [timeCovers, setTimeCovers] = useState<(string | null)[]>([]);

  const [globalTime, realSetGlobalTime] = useState<[string, number]>([
    timeNodes.arrs[currentLayer ?? "_null"][0],
    0,
  ]);
  const setGlobalTime = (time: [string, number]) => {
    realSetGlobalTime(time);
    props.timeReactive.emit({
      sender: "timeline",
      layout: "timeline",
      event: "jump",
      args: {
        isLeaf: !(time[0] in timeNodes.arrs),
        time: time,
      },
    });
  };
  const depth = useMemo(() => {
    let cur = currentLayer;
    let res = 0;
    while (cur !== null) {
      cur = timeNodes.objs[cur].parent;
      res += 1;
    }
    return res;
  }, [timeNodes.objs, currentLayer]);
  const [nodePorts, setNodePorts] = useState<VideoPortDisplay[]>([]);
  // const [selectedNode, setSelectedNode] = useState<string>(timeNodes.arrs[currentLayer ?? "_null"][0]);

  const setTimePosByMouseX = useCallback(
    (sliderPos: number) => {
      let accPos = 16 - 5;
      let gTime: [number, number] = [0, 0];
      const arr = timeNodes.arrs[currentLayer ?? "_null"];
      for (let i = 0; accPos < sliderPos && i < arr.length; i++) {
        const node = timeNodes.objs[arr[i]];
        if (accPos + node.width >= sliderPos) {
          gTime[1] = (sliderPos - accPos) / node.width;
          break;
        }
        accPos += node.width + 8;
        if (i === arr.length - 1) {
          gTime[1] = 1;
        } else {
          gTime[0]++;
        }
      }
      setGlobalTime([arr[gTime[0]], gTime[1]]);
      // console.log([arr[gTime[0]], gTime[1]]);
    },
    [currentLayer, timeNodes.objs, timeNodes.arrs]
  );

  const timeSliderPos = useMemo(() => {
    try {
      let left = 16 - 5;
      const arr = timeNodes.arrs[currentLayer ?? "_null"];
      const globalIndex = arr.indexOf(globalTime[0]);
      for (let i = 0; i < globalIndex; i++) {
        const node = timeNodes.objs[arr[i]];
        left += node.width + 8;
      }
      left += timeNodes.objs[globalTime[0]].width * globalTime[1];
      return left;
    } catch (e) {
      return 0;
    }
  }, [globalTime, timeNodes.objs, timeNodes.arrs, currentLayer]);

  const handleToolClick = (tool: typeof toolState) => {
    setToolState(tool);
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log(event);
    const { active } = event;
    if (active.data.current!.type === "node") {
      const idStr = active.id.toString();
      if (toolState === "merge") {
        setNodeDragging(timeNodes.objs[idStr.slice(0, idStr.length - 3)]);
      } else if (toolState === "move") {
        setNodeDragging(timeNodes.objs[idStr]);
      }
    }
  };

  const handleMergeTool = (over: string, active: string) => {
    chgTimeNodes((timeNodes) => {
      const cur = timeNodes.arrs[currentLayer ?? "_null"];
      const activeIdx = cur.indexOf(active);
      cur.splice(activeIdx, 1);
      const overIdx = cur.indexOf(over);
      if (over in timeNodes.arrs) {
        timeNodes.arrs[over].push(active);
        setGlobalTime([over, 0]);
      } else {
        const newNode = {
          id: v4(),
          parent: currentLayer,
          width: 144,
          data: {},
          ports: [],
        } as TimeNodeData;
        timeNodes.objs[newNode.id] = newNode;
        cur[overIdx] = newNode.id;
        timeNodes.arrs[newNode.id] = [over, active];
        setGlobalTime([over, 0]);
        setCurrentLayer(newNode.id);
      }
    });
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

      if (toolState === "move") {
        if (active.id !== over.id) {
          chgTimeNodes((items) => {
            const arr = items.arrs[currentLayer ?? "_null"];
            const oldIndex = arr.indexOf(active.id.toString());
            const newIndex = arr.indexOf(over.id.toString());
            items.arrs[currentLayer ?? "_null"] = arrayMove(
              arr,
              oldIndex,
              newIndex
            );
          });
        }
      } else if (toolState === "merge") {
        if (active.id !== over.id) {
          handleMergeTool(over.data.current!.nId, active.data.current!.nId);
        }
      }
    }
  };

  const handleStackClick = (e: any, id: string) => {
    if (!(id in timeNodes.arrs)) {
      let node: HTMLElement | null = timeAreaRef.current;
      while (node && node.offsetLeft === 0) {
        node = node.parentElement;
      }
      let pos =
        e.clientX -
        (node?.offsetLeft ?? 0) +
        timeAreaRef.current!.scrollLeft -
        5;
      setTimePosByMouseX(pos);
    } else {
      setGlobalTime([id, 0]);
    }
  };

  const handleStackDoubleClick = (id: string) => {
    if (id in timeNodes.arrs) {
      setCurrentLayer(id);
      setGlobalTime([timeNodes.arrs[id][0], 0]);
    }
  };

  const handleUpToolClick = () => {
    if (!currentLayer) return;
    setCurrentLayer((currentLayer) => {
      if (!currentLayer) return currentLayer;
      const parent = timeNodes.objs[currentLayer].parent;
      setGlobalTime([timeNodes.arrs[parent ?? "_null"][0], 0]);
      return parent;
    });
  };

  const generateNewNode = (
    draft: typeof timeNodes,
    modelDraft: PlayModel,
    id?: string,
    layer?: string | null
  ) => {
    let usedLayer = typeof layer === "undefined" ? currentLayer : layer;
    const obj = {
      id: id ?? v4(),
      parent: usedLayer,
      width: 144,
      data: {},
      ports: [],
    } as TimeNodeData;
    draft.objs[obj.id] = obj;
    draft.arrs[usedLayer ?? "_null"].push(obj.id);
    modelDraft.objTab[obj.id] = {
      id: obj.id,
      type: "ZStack",
      layoutType: "Layout",
      parent: null,
      endTo: null,
      data: {
        children: []
      },
    };
  };

  const handleAddToolClick = () => {
    chgTimeNodes((timeNodes, modelDraft) => {
      generateNewNode(timeNodes, modelDraft!);
    });
  };

  const handleDeleteToolClick = () => {
    // 删除一个场景的流程
    // 1. 如果是单个场景，执行删除，否则首先删除所有子场景
    // 2. 删除所有引用该节点的port和node
    // 3. 调整timeArrs
    // 4. 删除timeNodes
    // 5. 删除objTab
    // 6. 如果这个场景是最后一个，生成一个同名的
    const deleted = new Set<string>();
    const recursiveDel = (draft: typeof timeNodes, id: string) => {
      deleted.add(id);
      if (!(id in draft.arrs)) {
        delete draft.objs[id];
        return;
      }
      const children = draft.arrs[id];
      delete draft.objs[id];
      delete draft.arrs[id];
      for (const i of children) {
        recursiveDel(draft, i);
      }
    };
    let newGlobalTime: [string, number] = [...globalTime];
    chgTimeNodes((draft, modelDraft) => {
      if (!globalTime[0]) {
        return;
      }
      let toRemove: string | null = globalTime[0];
      // 如果删除后某个node没有子节点，那么应该将外面的node一起删除
      while (
        toRemove &&
        draft.arrs[draft.objs[toRemove].parent ?? "_null"].length === 1
      ) {
        toRemove = draft.objs[toRemove].parent;
      }
      console.log(toRemove);
      if (toRemove === null) {
        // 只剩一个的情况
        recursiveDel(draft, draft.arrs["_null"][0]);
        // setTimeout(() => setCurrentLayer(null), 0);
        setCurrentLayer(null);
        const removed = draft.arrs["_null"].splice(0, 1);
        generateNewNode(draft, modelDraft!, removed[0], null);
        newGlobalTime = [draft.arrs["_null"][0], 0];
        console.log(JSON.parse(JSON.stringify(draft)));
      } else {
        const parent = draft.objs[toRemove].parent;
        setCurrentLayer(parent);
        const targetIndex = draft.arrs[parent ?? "_null"].indexOf(toRemove);
        draft.arrs[parent ?? "_null"].splice(targetIndex, 1);
        newGlobalTime = [
          pickFirst2(draft.arrs[parent ?? "_null"][0], modelDraft!)!,
          0,
        ];
        console.log([
          pickFirst2(draft.arrs[parent ?? "_null"][0], modelDraft!)!,
          0,
        ]);
        recursiveDel(draft, toRemove);
      }
      for (const i in modelDraft!.timeNodes) {
        const node = modelDraft!.timeNodes[i];
        const removePorts = new Set<number>();
        for (let j = 0; j < node.ports.length; j++) {
          if (deleted.has(node.ports[j].target)) {
            removePorts.add(j);
          }
        }
        node.ports = node.ports.filter((val, idx) => !removePorts.has(idx));
      }
      const newEvents = [];
      for (const i of modelDraft!.events) {
        if (!deleted.has(i.args.target)) {
          newEvents.push(i);
        }
      }
      modelDraft!.events = newEvents;
      setTimeout(() => setGlobalTime(newGlobalTime), 0);
    });
    setTimeout(() => setGlobalTime([...newGlobalTime]), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      handleDeleteToolClick();
    }
  };

  const updateCovers = () => {
    console.log("update covers")
    try {
      const newCovers: (string | null)[] = [];
      const promises = [];
      for (let i of timeNodes.arrs[currentLayer ?? "_null"]) {
        newCovers.push(null);
      }
      for (let i = 0; i < newCovers.length; i++) {
        if (newCovers[i]) {
          continue
        }
        promises.push(
          getVideoLayout(
            timeNodes.arrs[currentLayer ?? "_null"][i],
            model.objTab
          )
            .then((res) => {
              newCovers[i] = res;
            })
            .catch((err) => {
              console.log(err)
            })
        );
      }
      Promise.all(promises).then(() => {
        setTimeCovers(newCovers);
      });
    } catch (e) {}
  }

  useEffect(() => {
    setTimeout(() => {
      setTimePosByMouseX(0)
    }, 50)
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.scrollWidth;
      canvasRef.current.height = canvasRef.current.scrollHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx!.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      const outPortList: VideoPortDisplay[] = [];
      const inPortList: VideoPortDisplay[] = [];
      let left = 16;
      const idToPos: { [x: string]: [number, number] } = {};

      for (let i of timeNodes.arrs[currentLayer ?? "_null"]) {
        const node = timeNodes.objs[i];
        idToPos[node.id] = [left, node.width];
        left += node.width + 8;
      }

      const getPosById = (id: string) => {
        let nId: string | null = id;
        while (nId && !(nId in idToPos)) {
          nId = timeNodes.objs[nId].parent;
        }
        if (nId) return idToPos[nId];
        else return null;
      };

      left = 16;

      const clearNodeBuf = (nodeBuf: PortData[], i: TimeNodeData) => {
        if (nodeBuf.length === 0) return;
        const rep = nodeBuf[0];
        let pos = left + rep.fromTime * (i.width - 16);
        let realLen = 0;
        for (let j of nodeBuf) {
          const tar = getPosById(j.target);
          if (!tar) {
            continue;
          }
          realLen += 1;
          let left = tar[0] + j.toTime * (tar[1] - 16);
          inPortList.push({
            type: "in",
            state: globalTime[0] === i.id ? "activated" : "deactivated",
            left,
            number: 1,
          });
          drawCurveWithArrow({
            ctx: ctx!,
            from: [pos, 56],
            to: [left + (pos > left ? 8 : 0), 64],
            color:
              globalTime[0] === i.id
                ? theme.palette.primary.main
                : theme.palette.grey[400],
          });
        }
        if (realLen > 0) {
          outPortList.push({
            type: "out",
            state: globalTime[0] === i.id ? "activated" : "deactivated",
            left: pos,
            number: nodeBuf.length,
          });
        }
      };

      for (let i of timeNodes.arrs[currentLayer ?? "_null"]) {
        const node = timeNodes.objs[i];
        let nodeBuf: PortData[] = [];
        let subNodes: PortData[] = [];
        let subNodeStack = [node];
        while (subNodeStack.length > 0) {
          const subNode = subNodeStack.pop()!;
          for (const j of subNode.ports) {
            let targetPar = timeNodes.objs[j.target];
            let selfContains = false;
            while (targetPar.parent) {
              if (targetPar.parent === i) {
                selfContains = true;
                break;
              }
              targetPar = timeNodes.objs[targetPar.parent];
            }
            if (!selfContains) {
              subNodes.push(j);
            }
          }
          if (subNode.id in timeNodes.arrs) {
            for (let i of timeNodes.arrs[subNode.id]) {
              subNodeStack.push(timeNodes.objs[i]);
            }
          }
        }
        subNodes = subNodes.sort((a, b) => a.fromTime - b.fromTime);
        for (let j of subNodes) {
          if (
            nodeBuf.length === 0 ||
            nodeBuf[nodeBuf.length - 1].fromTime === j.fromTime
          ) {
            nodeBuf.push(j);
          } else {
            clearNodeBuf(nodeBuf, node);
            nodeBuf = [j];
          }
        }
        clearNodeBuf(nodeBuf, node);
        nodeBuf = [];
        left += node.width + 8;
      }

      const newNodePorts = inPortList.concat(outPortList);
      setNodePorts(newNodePorts);

      updateCovers()
    }
  }, [
    timeNodes.objs,
    timeNodes.arrs,
    currentLayer,
    globalTime,
    canvasRef.current,
    timeAreaRef.current,
    model.objTab,
    timeNodeBoxRef.current?.scrollWidth
  ]);

  useObserve(
    props.timeReactive,
    (r) => {
      r.filter((e) => e.event === "jump" && e.layout === "Player").map((e) => {
        setCurrentLayer(timeNodes.objs[e.args.time[0]].parent);
        realSetGlobalTime(e.args.time as typeof globalTime);
      });
    },
    [timeNodes.objs, timeNodes.arrs, currentLayer, globalTime]
  );

  const timeNodeInner = (
    <>
      <TimeNodeSpace key={"s-1"} idx={-1} width={8} tool={toolState} />
      {timeNodes.arrs[currentLayer ?? "_null"]
        .map((x) => timeNodes.objs[x])
        .map((x, idx) => (
          <React.Fragment key={x.id}>
            <TimeNode
              key={x.id}
              idx={idx}
              id={x.id}
              width={x.width}
              highlight={
                x.id !== globalTime[0] ? "none" : depth % 2 ? "par" : "ser"
              }
              folded={x.id in timeNodes.arrs}
              onActive={(e) => handleStackClick(e, x.id)}
              onOpen={() => handleStackDoubleClick(x.id)}
              tool={toolState}
              img={timeCovers[idx] ?? null}
            />
            <TimeNodeSpace
              key={"t" + x.id}
              idx={idx}
              width={8}
              tool={toolState}
            />
          </React.Fragment>
        ))}
    </>
  );

  return (
    <Box onKeyDown={(e) => handleKeyPress(e)} tabIndex={0} sx={{position: "relative", width: "100%", height: "100%"}}>
      <Stack
        direction="row"
        sx={{
          position: "absolute",
          top: 8,
          left: 4,
          zIndex: 200,
          width: "100%"
        }}
      >
        <IconButton
          size="small"
          title="Up"
          onClick={handleUpToolClick}
          disabled={currentLayer === null}
        >
          <ArrowUpward />
        </IconButton>
        <IconButton size="small" title="Add Event" onClick={handleAddToolClick}>
          <Add />
        </IconButton>
        {/* <IconButton
          size="small"
          title="删除场景"
          onClick={handleDeleteToolClick}
        >
          <Delete />
        </IconButton> */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <IconButton
          size="small"
          onClick={() => handleToolClick("cursor")}
          color={toolState === "cursor" ? "primary" : "default"}
          title="Selection Mode"
        >
          <NearMe sx={{ transform: "rotateY(180deg)" }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleToolClick("move")}
          color={toolState === "move" ? "primary" : "default"}
          title="Move Mode"
        >
          <PanTool />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleToolClick("merge")}
          color={toolState === "merge" ? "primary" : "default"}
          title="Merge Mode"
        >
          <Merge />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <IconButton size="small" title="Cut" disabled>
          <ContentCut />
        </IconButton>
        <IconButton size="small" title="Copy" disabled>
          <ContentCopy />
        </IconButton>
        <IconButton size="small" title="Paste" disabled>
          <ContentPaste />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Box sx={{ position: "relative", mt: 1 }}>
          <If v-if={depth % 2 === 0}>
            <LinearScale />
            <Else>
              <AccountTree />
            </Else>
          </If>
        </Box>
        <Typography p={1}>{depth % 2 ? "Parallel" : "Sequential"}</Typography>
        <Divider />
        <Typography p={1}>{`Current Event: ${
          timeNodes.objs[globalTime[0]]?.id ?? "Null"
        }`}</Typography>
        <Box flexGrow={1} />
        <Box mr={2}>
          <IconButton
            size="small"
            title="Remove Event"
            onClick={() => handleDeleteToolClick()}
            sx={{
              '&:hover': {
                color: theme.palette.error.main
              }
            }}
          >
            <DeleteOutline />
          </IconButton>
        </Box>
      </Stack>
      <HorizontalScroller sx={{ height: "100%" }} ref={timeAreaRef}>
        <Box
          sx={{
            position: "relative",
            height: "calc(100% - 7px)",
            userSelect: "none",
          }}
        >
          <Box
            ref={canvasRef}
            component="canvas"
            sx={{
              position: "absolute",
              width: timeNodeBoxRef.current?.scrollWidth ?? "100%",
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
            {nodePorts.map((x, idx) => (
              <PortIcon key={x.left + idx} {...x} />
            ))}
          </Box>
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Box
              ref={timeNodeBoxRef}
              sx={{
                position: "absolute",
                height: "100%",
                top: 0,
                left: 0,
              }}
            >
              <Stack
                direction="row"
                spacing={0}
                sx={{
                  px: 1,
                  mt: 9,
                }}
              >
                {toolState === "move" ? (
                  <SortableContext
                    items={timeNodes.arrs[currentLayer ?? "_null"]}
                    strategy={horizontalListSortingStrategy}
                  >
                    {timeNodeInner}
                    {nodeDragging ? (
                      <DragOverlay>
                        <TimeNode
                          idx={-1}
                          id={""}
                          highlight={
                            nodeDragging.id !== globalTime[0]
                              ? "none"
                              : depth % 2
                              ? "par"
                              : "ser"
                          }
                          folded={nodeDragging.id in timeNodes.arrs}
                          tool={toolState}
                          grabbing
                        />
                      </DragOverlay>
                    ) : null}
                  </SortableContext>
                ) : toolState === "merge" ? (
                  timeNodeInner
                ) : (
                  timeNodeInner
                )}
              </Stack>
            </Box>
            <TimeSlider left={timeSliderPos} />
          </DndContext>
        </Box>
      </HorizontalScroller>
    </Box>
  );
};
