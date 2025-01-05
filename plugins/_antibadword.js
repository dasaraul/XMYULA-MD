let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i

export async function before(m, { isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return 
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let isBadword = badwordRegex.exec(m.text)
    
    if (chat.antiBadword && isBadword && m.isGroup) {
        user.warn += 1
        
        // Template pesan warning
        const warningMessage = `📛 Kata Kata Toxic Terdeteksi

YuLa Memberi Peringatan: ${user.warn} / 5

[❗] Jika *Tamaengs Bot* sudah memperingatkanmu sebanyak 5x. Kamu akan dikeluarkan dari group ini.

" チッ... タマエンさんがこう言うなら、覚悟しろよ... 黙れ！二度と悪口を言うな！

Tch... Tamaengs-san ga kou iu nara, kakugo shiro yo... Damare! Nido to waruguchi wo iu na!!`

        // Kirim pesan dengan media
        await conn.sendMessage(m.chat, {
            image: { url: '../media/image1.jpg' }, // Pastikan file warning.jpg ada di folder yang sama
            caption: warningMessage,
            fileLength: 99999999999999,
            contextInfo: {
                externalAdReply: {
                    title: 'Warning System',
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: '../media/image1-thumb.jpg', // Thumbnail kecil untuk preview
                    sourceUrl: ''
                }
            }
        })
        
        if (user.warn >= 5) {
            user.warn = 0
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
    return !0
}