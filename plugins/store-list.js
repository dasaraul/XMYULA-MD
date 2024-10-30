import _0x2193f7 from 'moment-timezone';
let handler = async (_0x22a1ef, {
  conn: _0x4725de,
  noPrefix: _0x495c11,
  command: _0x218ead,
  groupMetadata: _0x20b8a5
}) => {
  let _0x9e9355 = Object.entries(db.data.chats[_0x22a1ef.chat].listStr).map(([_0xa489df, _0x162c7d]) => {
    return {
      'nama': _0xa489df,
      ..._0x162c7d
    };
  }).map(_0x55f43b => _0x55f43b.nama);
  let _0x14073e = _0x9e9355.sort();
  let _0x49a7b2 = ucapan();
  let _0xb2150b = _0x14073e.map(_0x3ddb63 => {
    return ("\n○ " + _0x3ddb63.toUpperCase() + "\n").trim();
  }).filter(_0x119c1b => _0x119c1b).join("\n");
  let _0x156aa3 = _0x49a7b2 + " @" + _0x22a1ef.sender.split`@`[0x0] + "\nDi bawah ini adalah list Store\n*" + _0x20b8a5.subject + "*\n\nUntuk melihat List\nKetik *Tulisan* di bawah ini\n*——————— 𝙻𝙸𝚂𝚃 𝚂𝚃𝙾𝚁𝙴 ———————*\n\n" + _0xb2150b + "\n";
  if (_0x9e9355[0x0]) {
    return await _0x4725de.sendMessage(_0x22a1ef.chat, {
      'text': _0x156aa3,
      'contextInfo': {
        'mentionedJid': [_0x22a1ef.sender]
      }
    });
  } else {
    throw "\nBelum Ada List Yang Ditambahkan Admin\nketik *.addlist <text>* untuk menambahkan daftar menu.\n\nJika kamu ingin melihat allfitur tulis *.allmenu*";
  }
};
handler.help = ['list'];
handler.tags = ["store"];
handler.customPrefix = /^(menu|list)$/i;
handler.command = new RegExp();
handler.group = true;
export default handler;
function ucapan() {
  const _0x2dd53c = _0x2193f7.tz("Asia/Jakarta").format('HH');
  var _0x32793b = "🌅 Pagi";
  if (_0x2dd53c >= '03' && _0x2dd53c <= '10') {
    _0x32793b = "🌅 Pagi";
  } else {
    if (_0x2dd53c >= '10' && _0x2dd53c <= '15') {
      _0x32793b = "☀️ Siang";
    } else {
      if (_0x2dd53c >= '15' && _0x2dd53c <= '18') {
        _0x32793b = "🌇 Sore";
      } else if (_0x2dd53c >= '18' && _0x2dd53c <= '23') {
        _0x32793b = "🌃 Malam";
      } else {
        _0x32793b = "🌃 Malam";
      }
    }
  }
  return _0x32793b;
}