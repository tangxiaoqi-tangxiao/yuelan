import path from 'path'

const resources = path.join(__dirname.replace("app.asar", "app.asar.unpacked"), '..', '..', 'resources');

export { resources }