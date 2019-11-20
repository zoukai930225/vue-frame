const path = require('path')
const fs = require('fs')
const os = require('os')

const args = process.argv
const fsName = args[2] || undefined // 新页面文件夹
if (fsName === undefined) {
  console.log('缺少参数：页面文件名')
  return
}
const pageName = convert(fsName) // 新页面(类)名
const storeFsName = fsName + '-store'
const routeFsName = fsName + 'Router'
const storeClassName = convert(storeFsName)
const storeName = store(storeClassName)
const routeName = store(pageName)

const basePath = path.dirname(__dirname)
const scss = path.join(__dirname, 'temp', 'style.temp')
const css = path.join(__dirname, 'temp', 'style.temp')
const storeTemp = path.join(__dirname, 'temp', 'store.temp')
const index = path.join(__dirname, 'temp', 'index.temp')
const routes = path.join(__dirname, 'temp', 'router.temp')
const stores = path.join(basePath, 'src', 'store', 'index.ts')
const routesi = path.join(basePath, 'src', 'router', 'index.ts')
// const app = path.join(basePath, 'src', 'pages', 'app', 'index.tsx')

var scssStr = fs.readFileSync(scss, { encoding: 'utf-8' })
var indexStr = fs.readFileSync(index, { encoding: 'utf-8' })
var storeTempStr = fs.readFileSync(storeTemp, { encoding: 'utf-8' })
var routesStr = fs.readFileSync(routes, { encoding: 'utf-8' })
var routesStrs = fs.readFileSync(routesi, { encoding: 'utf-8' })
var storeStr = fs.readFileSync(stores, { encoding: 'utf-8' })
// var routeStr = fs.readFileSync(routes, { encoding: 'utf-8' })
// var appStr = fs.readFileSync(app, { encoding: 'utf-8' })

const rclass = new RegExp('--class--', 'g')
const rstore = new RegExp('&store&', 'g')
const rcomp = new RegExp('&comp&', 'g')
const rrouter = new RegExp('&router&', 'g')
const rstate = new RegExp('&state&', 'g')
indexStr = indexStr.replace(rstore, storeName)
indexStr = indexStr.replace(rclass, pageName + 'Module')
indexStr = indexStr.replace(rcomp, pageName)
indexStr = indexStr.replace('*page*', fsName)
indexStr = indexStr.replace('&fs&', storeFsName)
scssStr = scssStr.replace('&class&', fsName + '-page')

storeTempStr = storeTempStr.replace(rclass, routeName)
storeTempStr = storeTempStr.replace(rstore, storeName)
storeTempStr = storeTempStr.replace(rcomp, pageName)
storeTempStr = storeTempStr.replace('&class&', pageName + 'Module')
storeTempStr = storeTempStr.replace(rstate, 'I' + pageName + 'State')

routesStr = routesStr.replace(rrouter, routeName)
routesStr = routesStr.replace(rcomp, pageName)
routesStr = routesStr.replace(rclass, routeFsName)
routesStrs = `import ${routeFsName} from './modules/${routeName}';${os.EOL}${routesStrs}`
routesStrs = insert(routesStrs, routeFsName + ',' + os.EOL, routesStrs.lastIndexOf(' /** when your routing map is too long, you can split it into small modules **/'))
storeStr = `import { ${storeName} } from './modules/${storeFsName}';${os.EOL}${storeStr}`
let storeStrin = fsName + ': ' + storeName + os.EOL
storeStr = insert(storeStr, storeStrin, storeStr.lastIndexOf(' /**插入位置 */'))
// routeStr = `${routeStr}${os.EOL}export const ${pageName} = generateLoadable(() => import('../pages/${fsName}'));`
// let appInsert = `${os.EOL}          <RouteGuard path='/${routeName}' component={routes.${pageName}}/>`
// appStr = insert(appStr, appInsert, appStr.lastIndexOf('<Switch>') + 8)

const pagePath = path.join(basePath, 'src', 'views', fsName)
try {
  fs.mkdirSync(pagePath)
} catch (e) {
  console.log('文件夹已存在！')
  return
}
fs.writeFileSync(path.join(pagePath, 'index.vue'), Buffer.from(indexStr))
fs.writeFileSync(path.join(pagePath, 'style.scss'), Buffer.from(scssStr))
fs.writeFileSync(path.join(pagePath, 'style.css'), '')
fs.writeFileSync(path.join(basePath, 'src', 'store', 'modules', storeFsName + '.ts'), Buffer.from(storeTempStr))
fs.writeFileSync(path.join(basePath, 'src', 'router', 'modules', fsName + '.ts'), Buffer.from(routesStr))
fs.writeFileSync(routesi, Buffer.from(routesStrs))
fs.writeFileSync(stores, Buffer.from(storeStr))
// fs.writeFileSync(routes, Buffer.from(routeStr))
// fs.writeFileSync(app, Buffer.from(appStr))

// console.log(`success! --${pageName}`)
// eslint-disable-next-line space-before-function-paren
function titleCase(s) {
  var i; var ss = s.toLowerCase().split(/\s+/)
  for (i = 0; i < ss.length; i++) {
    ss[i] = ss[i].slice(0, 1).toUpperCase() + ss[i].slice(1)
  }
  return ss.join('')
}

// eslint-disable-next-line space-before-function-paren
function convert(str) {
  let arr = str.split('-')
  arr = arr.map((s) => { return titleCase(s) })
  return arr.join('')
}

// eslint-disable-next-line space-before-function-paren
function store(name) {
  let arr = name.split('')
  arr[0] = arr[0].toLowerCase()
  return arr.join('')
}

// eslint-disable-next-line space-before-function-paren
function insert(str, item, index) {
  var newstr = ''
  var tmp = str.substring(0, index)
  var estr = str.substring(index, str.length)
  newstr += tmp + item + estr
  return newstr
}
