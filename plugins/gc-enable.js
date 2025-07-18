import moment from 'moment-timezone'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
    let isEnable = /true|enable|(turn)?on|1/i.test(command)
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let bot = global.db.data.settings[conn.user.jid] || {}
    let name = `${user.registered ? user.name : conn.getName(m.sender)}`
    let type = (args[0] || '').toLowerCase()
    let isAll = false, isUser = false
    
    let caption = `
╭──「 *PENGATURAN GRUP* 」───
│
├ • antilinkkick
├ • antilinkdelete
├ • antilinkwa 
├ • antitagsw
├ • antiporn 
├ • antiacara 
├ • antifile 
├ • antiaudio 
├ • antifoto 
├ • antipolling 
├ • antivideo 
├ • antitoxic 
├ • antibadword
├ • antidelete
├ • antiviewonce 
├ • antisticker 
├ • antistickerpack 
├ • antivirtex
├ • simi
├ • teks 
├ • restrict 
├ • game
├ • allfitur
├ • rpg 
├ • nsfw 
├ • welcome 
├ • autolevelup 
│
├──「 *PENGATURAN BOT* 」───
│
├ • autobackup
├ • autocleartmp
├ • autoresetlimit
├ • autoread
├ • composing
├ • gconly
├ • pconly
├ • public
├ • self
├ • swonly
├ • anticall
├ • menu2
╰───────────────────────
`.trim()

    switch (type) {
        case 'welcome':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.welcome = isEnable
            break
            
        case 'autolevelup':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.autolevelup = isEnable
            break
            
        case 'detect':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.detect = isEnable
            break
            
        case 'delete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.delete = isEnable
            break
            
        case 'antiviewonce':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.viewonce = isEnable
            break
            
        case 'antidelete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.delete = !isEnable
            break
            
        case 'teks':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.teks = isEnable
            break
            
        case 'antitagsw':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiTagSW = isEnable
            break
            
        case 'public':
        case 'self':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['self'] = !isEnable
            break
            
        case 'antilinkkick':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiLinkkick = isEnable
            break
            
        case 'antilinkdelete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiLinkdelete = isEnable
            break
            
        case 'antilinkwa':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiLinkWa = isEnable
            break
            
        case 'antiporn':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiPorn = isEnable
            break
            
        case 'antifoto':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiFoto = isEnable
            break
            
        case 'antiaudio':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiAudio = isEnable
            break
            
        case 'antiacara':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiAcara = isEnable
            break
            
        case 'antifile':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiDoc = isEnable
            break
            
        case 'antivideo':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiVideo = isEnable
            break
            
        case 'antipolling':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiPolling = isEnable
            break
            
        case 'nsfw':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.nsfw = isEnable
            break
            
        case 'rpg':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.rpg = isEnable
            break
            
        case 'allfitur':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.xmaze = isEnable
            break
            
        case 'antivirtex':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiVirtex = isEnable
            break
            
        case 'simi':
            if (!(isAdmin || isOwner)) {
                global.dfail('admin', m, conn)
                throw false
            }
            chat.simi = isEnable
            break
            
        case 'composing':
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.composing = isEnable
            break
            
        case 'antisticker':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiSticker = isEnable
            break
            
        case 'antistickerpack':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiStickerPack = isEnable
            break
            
        case 'antibadword':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiBadword = isEnable
            break
            
        case 'antitoxic':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiToxic = isEnable
            break
            
        case 'restrict':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.pembatasan = isEnable
            break
            
        case 'game':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.game = isEnable
            break
            
        case 'anticall':
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.anticall = isEnable
            break
            
        case 'menu2':
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.thumbnail = isEnable
            break
            
        case 'autobackup':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.backup = isEnable
            break
            
        case 'autocleartmp':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.cleartmp = isEnable
            break
            
        case 'autoresetlimit':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.resetlimit = isEnable
            break
            
        case 'autoread':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.autoread = isEnable
            break
            
        case 'pconly':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['pconly'] = isEnable
            break
            
        case 'gconly':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['gconly'] = isEnable
            break
            
        case 'swonly':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['swonly'] = isEnable
            break
            
        default:
            return m.reply(caption)
    }
    
    await m.reply(`✅ *${type.toUpperCase()}* telah ${isEnable ? 'di *Hidupkan*' : 'di *Matikan*'} ${isAll ? 'untuk bot ini' : 'dalam obrolan ini'}!`)
}

handler.help = ['enable <command>', 'disable <command>']
handler.tags = ['group', 'owner']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|settings?)$/i

export default handler

function wish() {
    let wishloc = ''
    const time = moment.tz('Asia/Jakarta').format('HH')
    
    if (time >= 0 && time < 4) wishloc = 'Selamat Malam'
    else if (time >= 4 && time < 11) wishloc = 'Selamat Pagi'
    else if (time >= 11 && time < 15) wishloc = 'Selamat Siang'
    else if (time >= 15 && time < 18) wishloc = 'Selamat Sore'
    else wishloc = 'Selamat Malam'
    
    return wishloc
}
