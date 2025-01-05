let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i // tambahin sendiri

// Fungsi untuk mengirim media dari file lokal
async function sendLocalMedia(conn, jid, filePath, caption = '') {
    try {
        const mediaType = filePath.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
        
        if (mediaType === 'video') {
            return await conn.sendMessage(jid, { 
                video: { url: filePath }, 
                caption: caption,
                gifPlayback: false
            })
        } else {
            return await conn.sendMessage(jid, { 
                image: { url: filePath }, 
                caption: caption 
            })
        }
    } catch (e) {
        console.error('Error sending media:', e)
        // Jika gagal mengirim media, kirim pesan text saj
        await conn.sendMessage(jid, { text: caption })
        return null
    }
}

export async function before(m, { isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return 
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let isBadword = badwordRegex.exec(m.text)
    
    if (chat.antiBadword && isBadword && m.isGroup) {
        user.warn += 1
        
        // Menggunakan file lokal
        const mediaPath = '/media/sagiri.mp4'
        
        const warningMessage = `${user.warning >= 5 ? '*📮 Warning Kamu Sudah Mencapai 5 Maka Kamu Akan Dikick!*' : '*📮 Kata Kata Toxic Terdeteksi*'}

YuLa Memberi Peringatan: ${user.warn} / 5

[❗] Jika *${global.info.namebot}* sudah memperingatkanmu sebanyak 5x. Kamu akan dikeluarkan dari group ini.

" チッ... タマエンさんがこう言うなら、覚悟しろよ... 黙れ！二度と悪口を言うな！

Tch... Tamaengs-san ga kou iu nara, kakugo shiro yo... Damare! Nido to waruguchi wo iu na!!!`

        // Kirim pesan warning dengan media
        await sendLocalMedia(conn, m.chat, mediaPath, warningMessage)
        
        if (user.warn >= 5) {
            user.warn = 0
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
    return !0
}