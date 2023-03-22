import { Star } from "@mui/icons-material";
import { ComMenuItem } from "../../components/MenuItem";

export const ListSelection = (props: {
  content: { name: string; star: boolean }[]
  activeIdx: number
  onClick: (idx: number) => void
}) => {
  return (
    <>
      {props.content.map((y, yIdx) => (
        <ComMenuItem
          selected={yIdx === props.activeIdx}
          onClick={() => props.onClick(yIdx)}
          key={y.name}
        >
          {y.star ? <Star sx={{ mr: "8px" }} /> : ""}
          {y.name}
        </ComMenuItem>
      ))}
    </>
  );
};
