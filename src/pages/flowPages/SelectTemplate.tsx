import { ArrowBack, Check, Close, PlayCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import playButton from "../../assets/img/playButton.svg";
import { AspectRatio } from "../../components/AspectRatio";
import { ObservableEvent, Player } from "../../components/Player";
import { useReactive } from "../../tools/Reactive";
import { BranchEdit } from "./Branch/Edit";
import { BranchPreview } from "./Branch/Preview";
import { BranchDialog } from "./Branch/Settings";
import { CheckEdit } from "./Check/Edit";
import { CheckPreview } from "./Check/Preview";
import { CheckDialog } from "./Check/Settings";
import { ComparisonEdit } from "./Comparison/Edit";
import { ComparisonDialog } from "./Comparison/Settings";
import { CycleEdit } from "./Cycle/Edit";
import { CyclePreview } from "./Cycle/Preview";
import { CycleDialog } from "./Cycle/Settings";
import { ModelEditContext } from "./Detailed";

const VideoDescription = (props: any) => {
  const theme = useTheme();

  return (
    <Stack position="relative" height="100%">
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box component="img" src={playButton} onClick={props.onPlayClick} />
      </Box>
      <Box
        sx={{
          height: "60px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          position: "relative",
          cursor: "default",
        }}
      >
        <Stack direction="row" height="100%">
          <Box flexGrow={1} color={theme.palette.grey.A200} p="10px 12px">
            <Typography fontSize="12px">
              {props.data.description.shortText}
            </Typography>
            <Typography fontSize="12px" mt="6px">
              {props.data.description.aspectRatio}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            position="relative"
            height="100%"
            pr="12px"
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => props.onButtonClick(props.data)}
            >
              Select
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

enum PageState {
  Select,
  Edit,
  Preview,
}

export const DialogProxy = (props: {
  data: {type?: string, name?: string};
  onButtonClick: () => void;
  onSuccessClick: () => void;
}) => {
  switch (props.data?.type) {
    case "Comparison":
      return <ComparisonDialog {...props} />;
    case "Branch":
      return <BranchDialog {...props} />;
    case "Cycle":
      return <CycleDialog {...props} />;
    case "Check":
      return <CheckDialog {...props} />
    default:
      return <></>;
  }
};

const EditProxy = (props: {
  data: any
  handleLast: () => void
  handleNext: () => void
  firstPage: number
}) => {
  switch (props.data.type) {
    case "Comparison":
      return <ComparisonEdit {...props} />;
    case "Branch":
      return <BranchEdit {...props} />;
    case "Cycle":
      return <CycleEdit {...props} />;
    case "Check":
      return <CheckEdit {...props} />
    default:
      return <></>;
  }
}

const PlayProxy = (props: {
  data: any
}) => {
  switch (props.data.type) {
    case "Branch":
      return <BranchPreview />
    case "Cycle":
      return <CyclePreview />
    case "Check":
      return <CheckPreview />
    default:
      return <></>;
  }
}

export const SelectTemplate = (props: any) => {
  const theme = useTheme();
  const data = props.data;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  // const [activeData, setActiveData] = useState(props.data);
  const [selected, setSelected] = useState<number | null>(null)
  const [page, setPage] = useState(PageState.Select);
  const firstPage = useRef(0);
  const [model, setModel] = useContext(ModelEditContext)!;
  const reactive = useReactive<ObservableEvent>((r) => {}, [model]);
  const [showVideo, setShowVideo] = useState(true)

  const handleDialogOpen = (entry: number) => {
    setSelected(entry)
    setDialogOpen(true);
    // setActiveData()
  };

  const handlePreviewDialogOpen = (entry: number) => {
    setSelected(entry)
    setPreviewDialogOpen(true)
  }

  const handleNext = () => {
    firstPage.current = 0;
    if (page === PageState.Select) setPage(PageState.Edit);
    else if (page === PageState.Edit) setPage(PageState.Preview);
    else if (page === PageState.Preview) {
      props.onNextClick();
    }
  };

  const handleLast = () => {
    firstPage.current = -1;
    if (page === PageState.Select) {
    } else if (page === PageState.Edit) setPage(PageState.Select);
    else if (page === PageState.Preview) setPage(PageState.Edit);
  };

  const handleReplay = () => {
    setShowVideo(false)
    setTimeout(() => setShowVideo(true), 10)
  }

  if (page === PageState.Select) {
    return typeof data === "undefined" ? (
      <></>
    ) : (
      <Box px={7} py={3}>
        <Stack direction="row">
          <Typography variant="h5" fontSize="32px">
            {props.name}
          </Typography>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            size="small"
            sx={{ height: "32px", visibility: page === PageState.Select ? "hidden" : "visible" }}
            onClick={handleNext}
            disabled={page === PageState.Select && model.templateData.template === null}
          >
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
                }}
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
                    cursor: "pointer",
                    "&:hover": { opacity: "1" },
                  }}
                >
                  <VideoDescription
                    data={x}
                    onPlayClick={() => handlePreviewDialogOpen(idx)}
                    onButtonClick={() => handleDialogOpen(idx)}
                  />
                </Box>
              </Box>
              <Typography mt={1}>{x.text}</Typography>
            </Grid>
          ))}
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth={false}
        >
          <Stack
            sx={{
              position: "relative",
              width: "848px",
              height: "484px",
              background: theme.palette.grey[100],
            }}
          >
            <DialogProxy
              data={data[selected ?? 0]}
              onButtonClick={() => setDialogOpen(false)}
              onSuccessClick={handleNext}
            />
          </Stack>
        </Dialog>
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth={false}
        >
          <Box
            sx={{
              position: "relative",
              // ml: 4,
              // width: "723px",
              // height: "458px",
            }}
          >
            {/* <Player data={model} timeReactive={reactive} /> */}
            <PlayProxy data={data[selected ?? 0]} />
          </Box>
        </Dialog>
      </Box>
    );
  } else if (page === PageState.Edit) {
    return (
      <EditProxy
        data={data[selected ?? 0]}
        handleLast={handleLast}
        handleNext={handleNext}
        firstPage={firstPage.current}
      />
    );
  } else if (page === PageState.Preview) {
    return (
      <Stack py={3} sx={{ position: "relative", height: "100%" }}>
        <Stack direction="row" px={7}>
          <Button
            variant="text"
            size="small"
            sx={{
              height: "32px",
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0)",
              },
            }}
            onClick={handleLast}
          >
            <ArrowBack sx={{ fontSize: "16px", mr: 1 }} />
            Back
          </Button>
          <Box flexGrow={1} />
          <Button
            variant="contained"
            size="small"
            sx={{ height: "32px" }}
            onClick={handleNext}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ height: "32px", ml: 3 }}
            onClick={handleReplay}
          >
            Replay
          </Button>
        </Stack>
        <Box sx={{ flexGrow: 1, position: "relative", mt: 3, mx: 16 }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              aspectRatio: "16 / 9",
            }}
          >
            {/* <Box component="img" src={process.env.PUBLIC_URL + "/img/Group 119.png"} sx={{objectFit: "contain", width: "100%", height: "100%", display: "block"}} /> */}
            {showVideo && <Player data={model} timeReactive={reactive} />}
          </Box>
        </Box>
      </Stack>
    );
  } else {
    return <></>;
  }
};
