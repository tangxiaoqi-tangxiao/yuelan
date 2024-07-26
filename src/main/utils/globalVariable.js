import path from 'path'

const resourcesPath = path.join(__dirname.replace("app.asar", "app.asar.unpacked"), '..', '..', 'resources');
const WebPageDataPath = path.join(resourcesPath,'WebPageData');
export { resourcesPath,WebPageDataPath }