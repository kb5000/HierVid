import { PlayModel } from "../../../schema/PlayModel";
import { Position } from "../../../tools/Interfaces";

export interface CheckConfig {
  branchNumber: number;
  style: 0 | 1;
  selectedPattern: number;
  videos: Record<string, string>
  videoPos: Position[]
  videoText: Record<
    string,
    Position & {
      text: string;
    }
  >;
  type: "Check";
  prefix: string;
}

export const initConfig = () =>
  ({
    branchNumber: 2,
    style: 0,
    selectedPattern: 0,
    videos: {},
    videoPos: [],
    videoText: {
      "branch_0": {
        top: 80,
        left: 10,
        width: 35,
        height: 10,
        text: "",
      },
      "branch_1": {
        top: 80,
        left: 55,
        width: 35,
        height: 10,
        text: "",
      },
    },
    type: "Check",
    prefix: "Comparing Module 1",
  } as CheckConfig);

export const generateCheckConfig = (draft: PlayModel, config: CheckConfig, template: boolean, parent: string | null, addPos: number = -1) => {
  const p = config.prefix;
  if (template) {
    draft.templateData.template = "Check"
    draft.templateData.templateConfig = config
    draft.objTab.root.rootLayout = p + "window"
  }
  draft.templateData.componentConfig[p] = config;
  if (config.style === 0) {
    const windowChildren = [
      {
        pos: { left: 0, top: 0, width: 100, height: 100 },
        content: p + "branch",
      },
    ];
    for (let i = 0; i < config.branchNumber; i++) {
      windowChildren.push({
        pos: config.videoText["branch_" + i] ?? {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        content: p + "text_" + i,
      });
      draft.objTab[p + "text_" + i] = {
        id: p + "text_" + i,
        type: "Text",
        layoutType: "Layout",
        parent: p + "window",
        data: {
          content: config.videoText["branch_" + i]?.text ?? "",
          sx: {
            userSelect: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "24px",
            WebkitTextStroke: "0.6px white",
          },
        },
      };
      draft.events.push({
        sender: p + "text_" + i,
        event: "onClick",
        action: "jump",
        args: {
          target: p + "content_" + i,
        }
      })
    }
    draft.objTab[p + "window"] = {
      id: p + "window",
      type: "ZStack",
      layoutType: "Layout",
      data: {
        children: windowChildren,
      },
    };
    draft.objTab[p + "branch"] = {
      id: p + "branch",
      type: "Video",
      layoutType: "Layout",
      parent: p + "window",
      data: {
        src: config.videos["branch"] ?? "",
        sx: {
          objectFit: "cover",
        },
        loop: true,
        time: 0,
        volume: 100,
        length: null,
        play: true,
      },
    };
  } else {
    const windowChildren = []
    for (let i = 0; i < config.branchNumber; i++) {
      windowChildren.push({
        pos: config.videoPos[i] ?? {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        content: p + "branch_" + i,
      })
      draft.objTab[p + "branch_" + i] = {
        id: p + "branch_" + i,
        type: "Video",
        layoutType: "Layout",
        parent: p + "window",
        data: {
          src: config.videos["branch_" + i] ?? "",
          sx: {
            objectFit: "cover",
          },
          loop: true,
          time: 0,
          volume: 100,
          length: null,
          play: true,
        },
      };
      draft.events.push({
        sender: p + "branch_" + i,
        event: "onClick",
        action: "jump",
        args: {
          target: p + "content_" + i,
        }
      })
    }

    for (let i = 0; i < config.branchNumber; i++) {
      windowChildren.push({
        pos: config.videoText["branch_" + i] ?? {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        content: p + "text_" + i,
      });
      draft.objTab[p + "text_" + i] = {
        id: p + "text_" + i,
        type: "Text",
        layoutType: "Layout",
        parent: p + "window",
        data: {
          content: config.videoText["branch_" + i]?.text ?? "",
          sx: {
            userSelect: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "24px",
            WebkitTextStroke: "0.6px white",
          },
        },
      };
      draft.events.push({
        sender: p + "text_" + i,
        event: "onClick",
        action: "jump",
        args: {
          target: p + "content_" + i,
        }
      })
    }

    draft.objTab[p + "window"] = {
      id: p + "window",
      type: "ZStack",
      layoutType: "Layout",
      data: {
        children: windowChildren,
      },
    };
  }
  const windowPorts = []
  for (let i = 0; i < config.branchNumber; i++) {
    windowPorts.push({
      target: p + "content_" + i,
      fromTime: 1,
      toTime: 0
    })
  }
  draft.timeNodes[p + "window"] = {
    id: p + "window",
    parent: parent,
    width: 144,
    data: {
      component: p,
      type: "Check",
    },
    ports: windowPorts,
  };
  if (addPos === -1) {
    draft.timeArrs[parent ?? "_null"].push(p + "window")
  } else {
    draft.timeArrs[parent ?? "_null"].splice(addPos, 0, p + "window")
    addPos += 1
  }
  draft.timeNodes[p + "contentGroup"] = {
    id: p + "contentGroup",
    parent: parent,
    width: 144,
    data: {
      component: p,
      type: "Check",
    },
    ports: []
  }
  if (addPos === -1) {
    draft.timeArrs[parent ?? "_null"].push(p + "contentGroup")
  } else {
    draft.timeArrs[parent ?? "_null"].splice(addPos, 0, p + "contentGroup")
    addPos += 1
  }
  draft.timeArrs[p + "contentGroup"] = []
  for (let i = 0; i < config.branchNumber; i++) {
    draft.objTab[p + "content_" + i] = {
      id: p + "content_" + i,
      type: "Video",
      layoutType: "Layout",
      data: {
        src: config.videos["content_" + i] ?? "",
        sx: {
          objectFit: "cover",
        },
        loop: false,
        time: 0,
        volume: 100,
        length: null,
        play: true,
      },
    };
    draft.events.push({
      sender: p + "content_" + i,
      event: "onClick",
      action: "jump",
      args: {
        target: p + "window",
      }
    })
    draft.timeNodes[p + "content_" + i] = {
      id: p + "content_" + i,
      parent: p + "contentGroup",
      width: 144,
      data: {
        component: p,
        type: "Check",
      },
      ports: [{
        target: p + "window",
        fromTime: 1,
        toTime: 0
    }] 
    }
    draft.timeArrs[p + "contentGroup"].push(p + "content_" + i)
  }
};
