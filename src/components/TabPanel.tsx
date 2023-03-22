export const TabPanel = (props: {
  children: any,
  index: number,
  currentIndex: number | undefined,
}) => {
  if (props.index === props.currentIndex) {
    return props.children
  } else {
    return <></>
  }
}
