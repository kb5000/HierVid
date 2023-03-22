import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { If } from "../../components/Vue";
import { PlayModel } from "../../schema/PlayModel";
import { BranchConfig, generateBranchConfig } from "../flowPages/Branch/Config";
import { BranchComponentSetting } from "../flowPages/Branch/Settings";
import { CheckConfig, generateCheckConfig } from "../flowPages/Check/Config";
import { CheckComponentSetting } from "../flowPages/Check/Settings";
import { CycleConfig, generateCycleConfig } from "../flowPages/Cycle/Config";
import { CycleComponentSetting } from "../flowPages/Cycle/Settings";
import { ModelEditContext } from "../flowPages/Detailed";

export const handleUpdateComponent = (name: string | undefined, type: string | undefined, chgModel: (f: (model: PlayModel) => void) => void) => {
  if (!name) return;
  chgModel(model => {
    let nodeName = ""

    // 找到该组件的一个节点: nodeName
    for (let i in model.timeNodes) {
      const node = model.timeNodes[i]
      if (node.data.component === name) {
        nodeName = i
        break
      }
    }

    let parent: string | null = nodeName

    // 找到nodeName最外层的节点
    while (true) {
      parent = model.timeNodes[parent!].parent
      if (!parent || model.timeNodes[parent].data.component !== name) {
        break
      }
      nodeName = parent
    }

    // 往前找到nodeName这一层里面index最小的该组件的节点，这个位置就是以后添加新节点的位置
    let addPos = 0
    for (const i of model.timeArrs[parent ?? "_null"]) {
      if (model.timeNodes[i].data.component === name) {
        nodeName = i
        break
      }
      addPos += 1
    }
    
    console.log(parent, nodeName, addPos)

    // 更新步骤：
    // 1. 保存指向该节点的所有引用
    // 2. 执行正常的节点删除
    // 3. 利用config生成并添加一个新的节点，添加到posAdd的位置
    // 4. 恢复引用。如果timeNode树里没有这个场景了，那么引用就没了
    const allComponentNodes = new Set()

    for (const i in model.timeNodes) {
      const node = model.timeNodes[i]
      if (node.data.component === name) {
        allComponentNodes.add(i)
      }
    }

    const savedRefEvents = []
    const savedRefPorts: Record<string, any[]> = {}

    const newEvents = []
    for (const i of model.events) {
      // 自己组件不管
      let sender = i.sender
      while (model.objTab[sender]?.parent) {
        sender = model.objTab[sender].parent
      }
      if (model.timeNodes[sender]?.data.component === name) {
        continue
      }
      // 保存引用
      if (allComponentNodes.has(i.args.target)) {
        savedRefEvents.push(i)
      } else {
        newEvents.push(i)
      }
    }
    model.events = newEvents
    
    for (const i in model.timeNodes) {
      const node = model.timeNodes[i]
      if (node.data.component === name) {
        continue
      }
      const newPorts = []
      for (const j of node.ports) {
        if (allComponentNodes.has(j.target)) {
          if (!(i in savedRefPorts)) {
            savedRefPorts[i] = []
          }
          savedRefPorts[i].push(j)
        } else {
          newPorts.push(j)
        }
      }
    }
    
    // 执行删除

    const recursiveDel = (toDelete: string) => {
      const node = model.timeNodes[toDelete]
      if (!(toDelete in model.timeArrs)) {
        delete model.timeNodes[toDelete]
        return
      }
      const children = model.timeArrs[toDelete];
      delete model.timeArrs[toDelete]
      delete model.timeNodes[toDelete]
      for (const i of children) {
        recursiveDel(i)
      }
    }

    const newTimeArr = []
    for (const i of model.timeArrs[parent ?? "_null"]) {
      if (model.timeNodes[i].data.component === name) {
        recursiveDel(i)
      } else {
        newTimeArr.push(i)
      }
    }
    model.timeArrs[parent ?? "_null"] = newTimeArr

    // 执行添加

    const config = model.templateData.componentConfig[name]
    switch (type) {
      case "Branch":
        generateBranchConfig(model, config as BranchConfig, false, parent, addPos)
        break
      case "Check":
        generateCheckConfig(model, config as CheckConfig, false, parent, addPos)
        break
      case "Cycle":
        generateCycleConfig(model, config as CycleConfig, false, parent, addPos)
        break
    }

    // 恢复引用

    for (const i of savedRefEvents) {
      if (i.args.target in model.timeNodes) {
        model.events.push(i)
      }
    }

    for (const i in savedRefPorts) {
      const ports = savedRefPorts[i]
      if (i in model.timeNodes) {
        for (const j of ports) {
          if (j.target in model.timeNodes) {
            model.timeNodes[i].ports.push(j)
          }
        }
      }
    }
  })
}

export const ComponentEditor = (props: {}) => {
  const theme = useTheme();
  const [model, chgModel] = useContext(ModelEditContext)!;
  const type = model.templateData.currentConfig?.type
  const name = model.templateData.currentConfig?.name

  return (
    <>
      <If v-if={type === "Branch"}>
        <BranchComponentSetting name={name!} />
      </If>
      <If v-if={type === "Cycle"}>
        <CycleComponentSetting name={name!} />
      </If>
      <If v-if={type === "Check"}>
        <CheckComponentSetting name={name!} />
      </If>
      <If v-if={Boolean(name)}>
        <Box m={1}>
          <Button variant="contained" onClick={() => handleUpdateComponent(name, type, chgModel)}>Update</Button>
        </Box>
      </If>
    </>
  )
};
