let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i // tambahin sendiri

// Fungsi untuk mendeteksi tipe media dari URL
function getMediaType(url) {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm']
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    
    const extension = url.toLowerCase().split('.').pop()
    
    if (videoExtensions.includes('.' + extension)) return 'video'
    if (imageExtensions.includes('.' + extension)) return 'image'
    return null
}

// Fungsi untuk mengirim media dari URL
async function sendMediaFromUrl(conn, jid, url, caption = '') {
    try {
        const mediaType = getMediaType(url)
        if (!mediaType) throw new Error('Unsupported media type')
        
        const buffer = await fetch(url).then(res => res.buffer())
        
        if (mediaType === 'video') {
            return await conn.sendMessage(jid, { 
                video: buffer, 
                caption: caption,
                gifPlayback: url.toLowerCase().endsWith('.gif') // Auto convert gif to video
            })
        } else { // image
            return await conn.sendMessage(jid, { 
                image: buffer, 
                caption: caption 
            })
        }
    } catch (e) {
        console.error('Error sending media:', e)
        // Jika gagal mengirim media, kirim pesan text saja
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
        
        // URL media dari GitHub raw atau sumber lain
        // Contoh: https://raw.githubusercontent.com/username/repo/branch/path/to/image.jpg
        const warningMediaUrl = 'https://github.com/dasaraul/XMYULA-MD/raw/refs/heads/master/media/Sagiri%20Baka%20EAR%20RAPE%20100%25%20Legit.mp4'
        
        const warningMessage = `${user.warning >= 5 ? '*📮 Warning Kamu Sudah Mencapai 5 Maka Kamu Akan Dikick!*' : '*📮 Kata Kata Toxic Terdeteksi*'}

YuLa Memberi Peringatan: ${user.warn} / 5

[❗] Jika *${global.info.namebot}* sudah memperingatkanmu sebanyak 5x. Kamu akan dikeluarkan dari group ini.

" チッ... タマエンさんがこう言うなら、覚悟しろよ... 黙れ！二度と悪口を言うな！

Tch... Tamaengs-san ga kou iu nara, kakugo shiro yo... Damare! Nido to waruguchi wo iu na!!!`

        // Kirim pesan warning dengan media
        await sendMediaFromUrl(conn, m.chat, warningMediaUrl, warningMessage)
        
        if (user.warn >= 5) {
            user.warn = 0
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
    return !0
}