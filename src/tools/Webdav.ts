import axios, { AxiosInstance } from "axios"

export class Webdav {
  username: string
  password: string
  axiosBase: AxiosInstance

  constructor({url, username, password}: {url: string, username: string, password: string}) {
    this.username = username
    this.password = password
    this.axiosBase = axios.create({
      baseURL: url,
      auth: {
        username: this.username,
        password: this.password,
      }
    })
  }

  async containsFile(path: string) {
    return new Promise((resolve, reject) => {
      this.axiosBase({
        method: 'propfind',
        url: path,
      })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  getFile(path: string) {
    return this.axiosBase({
      method: 'get',
      url: path,
    })
  }

  uploadFile(path: string, content: any) {
    return this.axiosBase({
      method: 'put',
      url: path,
      data: content
    })
  }

  delete(path: string) {
    return this.axiosBase({
      method: 'delete',
      url: path,
    })
  }

  createDir(path: string) {
    return this.axiosBase({
      method: 'mkcol',
      url: path,
    })
  }
}
