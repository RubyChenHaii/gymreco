#!/usr/bin/env node
// 讀取 AboutTab.jsx 裡的 APP_VERSION，作為單一事實來源：
// 1. 同步寫入 build/service-worker.js 的 CACHE_NAME（讓瀏覽器能正確偵測到新版本，觸發更新提示）
// 2. 同步寫入根目錄 package.json 的 "version" 欄位（避免 npm 套件版本號跟實際 App 版本脫節）
const fs = require('fs');
const path = require('path');

const ABOUT_TAB_PATH    = path.join(__dirname, '..', 'src', 'tabs', 'AboutTab.jsx');
const SW_BUILD_PATH     = path.join(__dirname, '..', 'build', 'service-worker.js');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function fail(msg) {
  console.error(`\n❌ sync-sw-version 失敗：${msg}\n`);
  process.exit(1);
}

// 1. 從 AboutTab.jsx 讀取 APP_VERSION
if (!fs.existsSync(ABOUT_TAB_PATH)) {
  fail(`找不到 ${ABOUT_TAB_PATH}，請確認路徑是否正確（若檔案位置有變動，請同步更新本腳本裡的 ABOUT_TAB_PATH）`);
}
const aboutTabSource = fs.readFileSync(ABOUT_TAB_PATH, 'utf8');
const versionMatch = aboutTabSource.match(/const\s+APP_VERSION\s*=\s*["'`](.+?)["'`]/);
if (!versionMatch) {
  fail(`在 AboutTab.jsx 裡找不到 "const APP_VERSION = ..." 這一行，請確認寫法是否被改動過`);
}
const version = versionMatch[1];

// 2. 寫入 build/service-worker.js 的 CACHE_NAME
if (!fs.existsSync(SW_BUILD_PATH)) {
  fail(`找不到 ${SW_BUILD_PATH}，請確認本腳本是在 "react-scripts build" 之後執行`);
}
const swSource = fs.readFileSync(SW_BUILD_PATH, 'utf8');
const cacheNameRegex = /const\s+CACHE_NAME\s*=\s*["'`].+?["'`]/;
if (!cacheNameRegex.test(swSource)) {
  fail(`在 service-worker.js 裡找不到 "const CACHE_NAME = ..." 這一行，請確認寫法是否被改動過`);
}
const newSwSource = swSource.replace(cacheNameRegex, `const CACHE_NAME = 'gymreco-v${version}'`);
fs.writeFileSync(SW_BUILD_PATH, newSwSource, 'utf8');
console.log(`✅ service-worker.js 的 CACHE_NAME 已同步為 gymreco-v${version}`);

// 3. 寫入根目錄 package.json 的 "version" 欄位
if (!fs.existsSync(PACKAGE_JSON_PATH)) {
  fail(`找不到 ${PACKAGE_JSON_PATH}`);
}
const pkgRaw = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
let pkg;
try {
  pkg = JSON.parse(pkgRaw);
} catch (e) {
  fail(`package.json 解析失敗，請確認格式是否正確：${e.message}`);
}
if (pkg.version !== version) {
  pkg.version = version;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ package.json 的 version 已同步為 ${version}`);
} else {
  console.log(`ℹ️  package.json 的 version 已經是 ${version}，不需更動`);
}