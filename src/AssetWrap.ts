
export {default as imgPlayButton} from "./assets/img/addButton.svg";
export {default as imgAddButton} from "./assets/img/addButton.svg";

let _imgCompSettingPatterns: any[] = []
let _imgCompSettingPatternsSelected: any[] = []

for (let i = 1; i <= 10; i++) {
  _imgCompSettingPatterns.push((await import('./assets/img/comp/p' + i + '.svg')).default)
  _imgCompSettingPatternsSelected.push((await import('./assets/img/comp/p' + i + 's.svg')).default)
}

export const imgCompSettingPatterns = _imgCompSettingPatterns
export const imgCompSettingPatternsSelected = _imgCompSettingPatternsSelected


