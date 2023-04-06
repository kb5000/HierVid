import { PlayModel } from "../../../schema/PlayModel";
import { Position } from "../../../tools/Interfaces";

export interface CycleConfig {
  videoNumber: number;
  autoCycle: boolean;
  videos: ({ cover: string; url: string; length: number | null } | null)[];
  videoText: (
    | (Position & {
        text: string;
      })
    | null
  )[];
  type: "Cycle";
  prefix: string;
}

export const initConfig = () =>
  ({
    videoNumber: 3,
    autoCycle: false,
    videos: [null, null, null],
    videoText: [null, null, null],
    type: "Cycle",
    prefix: "Loop Module 1",
  } as CycleConfig);

export const generateCycleConfig = (
  draft: PlayModel,
  config: CycleConfig,
  template: boolean,
  parent: string | null,
  addPos: number = -1
) => {
  const p = config.prefix;
  if (template) {
    draft.templateData.template = "Cycle";
    draft.templateData.templateConfig = config;
    draft.objTab.root.rootLayout = p + "video0";
  }
  draft.templateData.componentConfig[p] = config;
  for (let i = 0; i < config.videoNumber; i++) {
    draft.objTab[p + "video" + i] = {
      id: p + "video" + i,
      type: "ZStack",
      layoutType: "Layout",
      data: {
        children: [
          {
            pos: { left: 0, top: 0, width: 100, height: 100 },
            content: p + "play" + i,
          },
          {
            pos: config.videoText[i] ?? {
              left: 10,
              top: 80,
              width: 80,
              height: 10,
            },
            content: p + "text" + i,
          },
        ],
      },
    };
    draft.objTab[p + "play" + i] = {
      id: p + "play" + i,
      type: "Video",
      layoutType: "Layout",
      parent: p + "video" + i,
      data: {
        src: config.videos[i]?.url ?? "",
        sx: {
          objectFit: "cover",
        },
        loop: false,
        time: 0,
        volume: 100,
        length: config.videos[i]?.length ?? null,
        play: true,
      },
    };
    draft.objTab[p + "text" + i] = {
      id: p + "text" + i,
      type: "Text",
      layoutType: "Layout",
      parent: p + "video" + i,
      data: {
        content: config.videoText[i]?.text ?? "",
        sx: {
          userSelect: "none",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "24px",
          WebkitTextStroke: "0.6px white",
        },
      },
    };
    if (i === config.videoNumber - 1) {
      draft.events.push({
        sender: p + "text" + i,
        event: "onClick",
        action: "jump",
        args: {
          target: p + "video0",
        },
      });
    } else {
      draft.events.push({
        sender: p + "text" + i,
        event: "onClick",
        action: "jump",
        args: {
          target: p + "video" + (i + 1),
        },
      });
    }
    draft.timeNodes[p + "video" + i] = {
      id: p + "video" + i,
      parent: parent,
      width: 144,
      data: {
        component: p,
        type: "Cycle",
      },
      ports:
        i === config.videoNumber - 1
          ? [
              {
                target: p + "video0",
                fromTime: 1,
                toTime: 0,
              },
            ]
          : [
              {
                target: p + "video" + (i + 1),
                fromTime: 1,
                toTime: 0,
              }
            ],
    };
    if (addPos === -1) {
      draft.timeArrs[parent ?? "_null"].push(p + "video" + i);
    } else {
      draft.timeArrs[parent ?? "_null"].splice(addPos + i, 0, p + "video" + i);
    }
  }
};
