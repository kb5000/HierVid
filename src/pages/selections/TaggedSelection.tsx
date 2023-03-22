import { Box, Chip, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { HorizontalScroller } from "../../components/HorizontalScroller";

const tags = [
  "内容分支",
  "商品介绍",
  "细节展示",
  "开场",
  "内容分支",
  "商品介绍",
  "细节展示",
  "开场",
];

export const MultiTagBar = (props: {
  tags: string[];
  activeTags: Set<number>;
  onChange: (newActiveTags: Set<number>) => void;
}) => {
  const handleClick = (idx: number) => {
    const cloned = new Set(props.activeTags);
    if (cloned.has(idx)) {
      cloned.delete(idx);
    } else {
      cloned.add(idx);
    }
    props.onChange(cloned);
  };

  return (
    <HorizontalScroller>
      <Box sx={{ pb: 2 }}>
        <Stack direction="row" spacing={1}>
          {tags.map((x, idx) => (
            <Chip
              key={idx}
              label={x}
              onClick={() => handleClick(idx)}
              variant={props.activeTags.has(idx) ? "filled" : "outlined"}
              color={props.activeTags.has(idx) ? "primary" : "default"}
            />
          ))}
        </Stack>
      </Box>
    </HorizontalScroller>
  );
};

export const TaggedSelection = (props: {
  content: { name: string; img: string }[];
  activeIdx: number;
  onClick: (idx: number) => void;
}) => {
  const [activeTags, setActiveTags] = useState(new Set<number>());

  return (
    <>
      <MultiTagBar
        tags={tags}
        activeTags={activeTags}
        onChange={(newActiveTags) => setActiveTags(newActiveTags)}
      />
      <Stack>
        {props.content.map((x, idx) => {
          return (
            <Box
              key={x.name}
              sx={{ mx: 2, my: 1, position: "relative", cursor: "pointer" }}
              onClick={() => props.onClick(idx)}
            >
              <Box
                component="img"
                src={process.env.PUBLIC_URL + x.img}
                sx={{ objectFit: "contain", width: "100%" }}
              ></Box>
              <Typography fontSize="0.8125rem">{x.name}</Typography>
            </Box>
          );
        })}
      </Stack>
    </>
  );
};
