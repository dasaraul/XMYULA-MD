import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw 'Quoted the sticker!'
  let stiker = false
  try {
    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw 'Reply sticker!'
    let img = await m.quoted.download()
    if (!img) throw 'Reply a sticker!'
    stiker = await addExif(img, packname || '', author || global.info.namebot + ' © 2024')
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, { asSticker: true })
    else throw 'Conversion failed'
  }
}
handler.help = ['wm <packname>|<author>']
handler.tags = ['sticker']
handler.command = /^(wm)$/i
handler.limit = true;
handler.register = true;

export default handler;