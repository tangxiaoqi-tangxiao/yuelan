import path from 'path'

const resources = path.join(__dirname.replace("app.asar", "app.asar.unpacked"), '..', '..', 'resources');
const WebPageDataPath = path.join(resources,'WebPageData');
export { resources,WebPageDataPath }