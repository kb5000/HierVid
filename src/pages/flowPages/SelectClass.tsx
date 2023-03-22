import { PlayCircle } from "@mui/icons-material";
import { Box, Button, Grid, Stack, Typography, useTheme } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../schema/Model";
import { ModelEditContext } from "./Detailed";

const TextDescription = (props: any) => {
  const theme = useTheme();

  return (
    <Typography
      color={theme.palette.common.white}
      sx={{
        overflowWrap: "break-word",
        whiteSpace: "pre-line",
        p: "24px",
      }}
    >
      {props.data.description}
    </Typography>
  );
};

export const SelectClass = (props: any) => {
  const theme = useTheme();
  const data = props.data;
  const [model, chgModel] = useContext(ModelEditContext)!
  const [chosenGrid, setChosenGrid] = useState<number | null>(null)

  // TODO: support multiple class rather than just one 'recent trend'
  useEffect(() => {
    setChosenGrid(model.templateData.selectedClass?.inner?.id ?? null)
  }, [model.templateData.selectedClass])

  const handleItemClick = (idx: number) => {
    setChosenGrid(state => {
      return idx
    })
  }

  const handleNextClick = () => {
    chgModel(model => {
      model.templateData.selectedClass = {
        name: props.name,
        inner: {
          id: chosenGrid,
          content: props.data[chosenGrid!],
        }
      }
    })
    props.onNextClick()
  }

  return typeof data === "undefined" ? (
    <></>
  ) : (
    <Box px={7} py={3}>
      <Stack direction="row">
        <Typography variant="h5" fontSize="32px">
          {props.name}
        </Typography>
        <Box flexGrow={1} />
        <Button variant="outlined" size="small" disabled={chosenGrid === null} sx={{ height: "32px" }} onClick={handleNextClick}>
          Next
        </Button>
      </Stack>
      <Grid container mt={3} columnGap={10} rowGap={4}>
        {props.data.map((x: any, idx: number) => (
          <Grid item key={x.text}>
            <Box
              sx={{
                position: "relative",
                width: "224px",
                height: "224px",
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "pointer",
                outline: chosenGrid === idx ? `4px solid ${theme.palette.primary.main}` : "none",
                outlineOffset: "4px"
              }}
              onClick={() => handleItemClick(idx)}
            >
              <Box
                component="img"
                src={process.env.PUBLIC_URL + x.img}
                alt={x.text}
                sx={{
                  objectFit: "cover",
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  userSelect: "none",
                  opacity: "0",
                  "&:hover": { opacity: "1" },
                }}
              >
                <TextDescription data={x} onButtonClick={props.onButtonClick} />
              </Box>
            </Box>
            <Typography mt={1}>{x.text}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
