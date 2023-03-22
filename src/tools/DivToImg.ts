import html2canvas from "html2canvas"

export const divToImage = async (ref: HTMLElement) => {
  const canvas = await html2canvas(ref)
  return canvas.toDataURL()
}
