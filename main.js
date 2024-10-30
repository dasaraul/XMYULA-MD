process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import './config.js';
import { createRequire } from 'module';
import _0x498eda, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
global.__filename = function filename(_0x4b5399 = import.meta.url, _0x4e4dfd = platform !== "win32") {
  return _0x4e4dfd ? /file:\/\/\//.test(_0x4b5399) ? fileURLToPath(_0x4b5399) : _0x4b5399 : pathToFileURL(_0x4b5399).toString();
};
global.__dirname = function dirname(_0x442c9f) {
  return _0x498eda.dirname(global.__filename(_0x442c9f, true));
};
global.__require = function require(_0x50db80 = import.meta.url) {
  return createRequire(_0x50db80);
};
import 'ws';
import { readdirSync, existsSync, readFileSync, watch } from 'fs';
import _0x3abead from 'yargs';
import { spawn } from 'child_process';
import _0x56aacc from 'lodash';
import 'console';
import _0x2f5ce2 from 'cfonts';
import _0x5f3ff2 from 'syntax-error';
import 'os';
import _0x9a492c from 'chalk';
import { format } from 'util';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import _0x4c9741 from 'pino';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
const {
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  PHONENUMBER_MCC
} = await import("@adiwajshing/baileys");
const {
  chain
} = _0x56aacc;
const PORT = process.env.PORT || process.env.SERVER_PORT || 0xbb8;
protoType();
serialize();
global.API = (_0x2c0eee, _0x3d14f1 = '/', _0x3cb3ea = {}, _0x161321) => (_0x2c0eee in global.APIs ? global.APIs[_0x2c0eee] : _0x2c0eee) + _0x3d14f1 + (_0x3cb3ea || _0x161321 ? '?' + new URLSearchParams(Object.entries({
  ..._0x3cb3ea,
  ...(_0x161321 ? {
    [_0x161321]: global.APIKeys[_0x2c0eee in global.APIs ? global.APIs[_0x2c0eee] : _0x2c0eee]
  } : {})
})) : '');
global.timestamp = {
  'start': new Date()
};
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(_0x3abead(process.argv.slice(0x2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts.prefix || "â€ŽxzXZ/i!#$%+Â£Â¢â‚¬Â¥^Â°=Â¶âˆ†Ã—Ã·Ï€âˆšâœ“Â©Â�?:;?&.\\-").replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + ']');
global.db = new Low(/https?:\/\//.test(opts.db || '') ? new cloudDBAdapter(opts.db) : /mongodb(\+srv)?:\/\//i.test(opts.db) ? opts.mongodbv2 ? new mongoDBV2(opts.db) : new mongoDB(opts.db) : new JSONFile((opts._[0x0] ? opts._[0x0] + '_' : '') + "database.json"));
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise(_0x9299b2 => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        _0x9299b2(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1000));
  }
  if (global.db.data !== null) {
    return;
  }
  global.db.READ = true;
  await global.db.read()['catch'](console.error);
  global.db.READ = null;
  global.db.data = {
    'users': {},
    'chats': {},
    'stats': {},
    'msgs': {},
    'banned': {},
    'sticker': {},
    'settings': {},
    ...(global.db.data || {})
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();
global.authFile = '' + (opts._[0x0] || "sessions");
console.log("Load AuthFile from " + authFile);
const {
  state,
  saveCreds
} = await useMultiFileAuthState(global.authFile);
const {
  version,
  isLatest
} = await fetchLatestBaileysVersion();
console.log("using WA v" + version.join('.') + ", isLatest: " + isLatest);
const pairingCode = process.argv.includes("--pairing");
const connectionOptions = {
  'version': version,
  'logger': _0x4c9741({
    'level': "silent"
  }),
  'printQRInTerminal': !pairingCode,
  'browser': global.browser,
  'auth': {
    'creds': state.creds,
    'keys': makeCacheableSignalKeyStore(state.keys, _0x4c9741().child({
      'level': "silent",
      'stream': 'store'
    }))
  }
};
global.conn = makeWASocket(connectionOptions);
conn.isInit = false;
if (!opts.test) {
  setInterval(async () => {
    if (global.db.data) {
      await global.db.write()['catch'](console.error);
    }
  }, 60000);
}
if (opts.server) {
  (await import("./server.js"))["default"](global.conn, PORT);
}
async function connectionUpdate(_0x208d18) {
  const {
    receivedPendingNotifications: _0x2dba17,
    connection: _0x30d616,
    lastDisconnect: _0x474796,
    isOnline: _0x155ab2,
    isNewLogin: _0x6d64a0
  } = _0x208d18;
  if (_0x6d64a0) {
    conn.isInit = true;
  }
  if (_0x30d616 == 'connecting') {
    console.log(_0x9a492c.redBright("Mengaktifkan Bot, Mohon tunggu sebentar..."));
  }
  if (_0x30d616 == 'open') {
    console.log(_0x9a492c.green("Tersambung"));
  }
  if (_0x155ab2 == true) {
    console.log(_0x9a492c.green("Status Aktif"));
  }
  if (_0x155ab2 == false) {
    console.log(_0x9a492c.red("Status Mati"));
  }
  if (_0x2dba17) {
    console.log(_0x9a492c.yellow("Menunggu Pesan Baru"));
  }
  if (_0x30d616 == "close") {
    console.log(_0x9a492c.red("koneksi terputus & mencoba menyambung ulang..."));
  }
  global.timestamp.connect = new Date();
  if (_0x474796 && _0x474796.error && _0x474796.error.output && _0x474796.error.output.statusCode !== DisconnectReason.loggedOut) {
    console.log(_0x9a492c.red('Connecting...'));
    await global.reloadHandler(true);
  }
  if (global.db.data == null) {
    await global.loadDatabase();
  }
}
process.on('uncaughtException', console.error);
let isInit = true;
let handler = await import("./handler.js");
global.reloadHandler = async function (_0x4406eb) {
  try {
    const _0x22c613 = await import("./handler.js?update=" + Date.now())["catch"](console.error);
    if (Object.keys(_0x22c613 || {}).length) {
      handler = _0x22c613;
    }
  } catch (_0xdf1f00) {
    console.error(_0xdf1f00);
  }
  if (_0x4406eb) {
    const _0x2f90f2 = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, {
      'chats': _0x2f90f2
    });
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off("messages.upsert", conn.handler);
    conn.ev.off("group-participants.update", conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off("message.delete", conn.onDelete);
    conn.ev.off("connection.update", conn.connectionUpdate);
    conn.ev.off("creds.update", conn.credsUpdate);
  }
  conn.welcome = "*@user*\n*𝚑𝚊𝚜 𝚓𝚘𝚒𝚗𝚎𝚍 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙*\n\n𝙱𝚎𝚏𝚘𝚛𝚎 𝚝𝚑𝚊𝚝, 𝚍𝚘𝚗𝚝 𝚏𝚘𝚛𝚐𝚎𝚝 𝚝𝚘 𝚛𝚎𝚊𝚍 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙 𝚛𝚞𝚕𝚎𝚜";
  conn.bye = "*@user* *𝚑𝚊𝚜 𝚕𝚎𝚏𝚝 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙*";
  conn.spromote = "@user sekarang admin!";
  conn.sdemote = "@user sekarang bukan admin!";
  conn.sDesc = "Deskripsi telah diubah ke \n@desc";
  conn.sSubject = "Judul grup telah diubah ke \n@subject";
  conn.sIcon = "Icon grup telah diubah!";
  conn.sRevoke = "Link group telah diubah ke \n@revoke";
  conn.handler = handler.handler.bind(global.conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn);
  conn.ev.on("messages.upsert", conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on("groups.update", conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on("connection.update", conn.connectionUpdate);
  conn.ev.on("creds.update", conn.credsUpdate);
  isInit = false;
  return true;
};
const pluginFolder = global.__dirname(join(__dirname, "./plugins/index"));
const pluginFilter = _0x48c450 => /\.js$/.test(_0x48c450);
global.plugins = {};
async function filesInit() {
  for (let _0x40941c of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      let _0x56ddd2 = global.__filename(join(pluginFolder, _0x40941c));
      const _0x1c511b = await import(_0x56ddd2);
      global.plugins[_0x40941c] = _0x1c511b["default"] || _0x1c511b;
    } catch (_0x24c1ca) {
      conn.logger.error(_0x24c1ca);
      delete global.plugins[_0x40941c];
    }
  }
}
filesInit().then(_0x6a512a => console.log(Object.keys(global.plugins)))['catch'](console.error);
global.reload = async (_0x4b54f4, _0x27d52e) => {
  if (/\.js$/.test(_0x27d52e)) {
    let _0x26815e = global.__filename(join(pluginFolder, _0x27d52e), true);
    if (_0x27d52e in global.plugins) {
      if (existsSync(_0x26815e)) {
        conn.logger.info("re - require plugin '" + _0x27d52e + "'");
      } else {
        conn.logger.warn("deleted plugin '" + _0x27d52e + "'");
        return delete global.plugins[_0x27d52e];
      }
    } else {
      conn.logger.info("requiring new plugin '" + _0x27d52e + "'");
    }
    let _0x1f9153 = _0x5f3ff2(readFileSync(_0x26815e), _0x27d52e, {
      'sourceType': "module",
      'allowAwaitOutsideFunction': true
    });
    if (_0x1f9153) {
      conn.logger.error("syntax error while loading '" + _0x27d52e + "'\n" + format(_0x1f9153));
    } else {
      try {
        const _0x4a1a4b = await import(global.__filename(_0x26815e) + "?update=" + Date.now());
        global.plugins[_0x27d52e] = _0x4a1a4b["default"] || _0x4a1a4b;
      } catch (_0x25b685) {
        conn.logger.error("error require plugin '" + _0x27d52e + "\n" + format(_0x25b685) + "'");
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([_0x401f8e], [_0x4b2237]) => _0x401f8e.localeCompare(_0x4b2237)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
  let _0x4b9242 = await Promise.all([spawn('ffmpeg'), spawn("ffprobe"), spawn("ffmpeg", ["-hide_banner", "-loglevel", 'error', "-filter_complex", "color", "-frames:v", '1', '-f', "webp", '-']), spawn("convert"), spawn("magick"), spawn('gm'), spawn('find', ["--version"])].map(_0x17cee8 => {
    return Promise.race([new Promise(_0x3160c7 => {
      _0x17cee8.on("close", _0x412ad0 => {
        _0x3160c7(_0x412ad0 !== 0x7f);
      });
    }), new Promise(_0x3416e3 => {
      _0x17cee8.on("error", _0x38b96a => _0x3416e3(false));
    })]);
  }));
  let [_0x13d2ac, _0x513dd8, _0x5249b7, _0x3fdc53, _0x2e31e3, _0x5d306c, _0x4a47a8] = _0x4b9242;
  console.log(_0x4b9242);
  let _0x352993 = global.support = {
    'ffmpeg': _0x13d2ac,
    'ffprobe': _0x513dd8,
    'ffmpegWebp': _0x5249b7,
    'convert': _0x3fdc53,
    'magick': _0x2e31e3,
    'gm': _0x5d306c,
    'find': _0x4a47a8
  };
  Object.freeze(global.support);
  if (!_0x352993.ffmpeg) {
    conn.logger.warn("Please install ffmpeg for sending videos (pkg install ffmpeg)");
  }
  if (_0x352993.ffmpeg && !_0x352993.ffmpegWebp) {
    conn.logger.warn("Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)");
  }
  if (!_0x352993.convert && !_0x352993.magick && !_0x352993.gm) {
    conn.logger.warn("Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)");
  }
}
_quickTest().then(() => conn.logger.info("☑️ Quick Test Done"))["catch"](console.error);
import _0x2b01f7 from 'readline';
const sleep = _0x502881 => {
  return new Promise(_0x5f319f => setTimeout(_0x5f319f, _0x502881));
};
const rl = _0x2b01f7.createInterface({
  'input': process.stdin,
  'output': process.stdout
});
const question = _0x42b594 => new Promise(_0x381372 => rl.question(_0x42b594, _0x381372));
if (pairingCode && !conn.authState.creds.registered) {
  console.clear();
  await sleep(0x1b58);
  console.clear();
  _0x2f5ce2.say("\nPAIRING CODE\n", {
    'font': "tiny",
    'align': "left",
    'gradient': ["red", "blue"]
  });
  console.log(_0x9a492c.bold.white("━━━━━━━━━━━ https://github.com/XM4ZE ━━━━━━━━━━━"));
  console.log(_0x9a492c.bold.green("\n\nMasukan nomor kamu :"));
  let phoneNumber = await question(_0x9a492c.bgBlack(_0x9a492c.greenBright("> ")));
  phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (!Object.keys(PHONENUMBER_MCC).some(_0xd5c63b => phoneNumber.startsWith(_0xd5c63b))) {
    console.log(_0x9a492c.bold.red("MASUKAN NOMORMU DENGAN BENAR AWALI DENGAN 62 !!!"));
    console.log(_0x9a492c.bold.green("\nMasukan nomor :"));
    phoneNumber = await question(_0x9a492c.bgBlack(_0x9a492c.greenBright('>')));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  }
  let code = await conn.requestPairingCode(phoneNumber);
  code = code?.["match"](/.{1,4}/g)?.["join"]('-') || code;
  console.log(_0x9a492c.bold.green("Kode tautan kamu : "), _0x9a492c.bold.yellow(code));
  rl.close();
}