import { resolve } from "path";
import { Config } from "../config";
import { Webdav } from "./Webdav";

var webdavConnection: Webdav | null = null;

export const URIBase = "/api";

export const getWebDavInstance = (): Webdav => {
  if (webdavConnection === null) {
    webdavConnection = new Webdav({
      url: URIBase,
      username: Config.webdavUsername,
      password: Config.webdavPassword,
    })
  }
  return webdavConnection;
};

const globalVideoCoverCache: Record<string, string | null> = {}

export const getVideoCover = (
  videoUrl: string
) => {
  return new Promise<string>((resolve, reject) => {
    if (videoUrl in globalVideoCoverCache) {
      if (globalVideoCoverCache[videoUrl] !== null) {
        resolve(globalVideoCoverCache[videoUrl]!)
      } else {
        setTimeout(async () => resolve(await getVideoCover(videoUrl)), 50)
      }
      return
    }
    globalVideoCoverCache[videoUrl] = null
    const video = document.createElement("video");
    video.crossOrigin = "*"
    video.style.objectFit = "cover"
    video.src = videoUrl;
    video.addEventListener("loadeddata", () => {
      let time = 20
      if (isFinite(video.duration)) {
        time = video.duration / 2
      }
      video.addEventListener('timeupdate', () => {
        const canvas = document.createElement("canvas");
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        // console.log(video, canvas)
        const res = canvas.toDataURL("image/webp")
        globalVideoCoverCache[videoUrl] = res
        resolve(res);
      });
      video.currentTime = time
    });
    video.addEventListener("error", (err) => {
      reject(err);
    });
  })
}
