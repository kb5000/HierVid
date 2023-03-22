import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ComAccordion = styled((props: any) => (
  <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  background: 'transparent',
  borderTop: "none",
  borderRight: "none",
}));

export const ComAccordionSummary = styled((props: any) => (
  <AccordionSummary
    {...props}
  />
))(({ theme }) => ({
  "& .MuiAccordionSummary-expandIconWrapper": {
    transform: "rotate(-90deg)",
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(0deg)",
  },
//   "& .MuiAccordionSummary-content": {
//     marginLeft: theme.spacing(1),
//   },
}));

export const ComAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));
