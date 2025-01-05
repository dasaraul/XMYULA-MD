let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i

export async function before(m, { conn, isBotAdmin }) {    // Tambahkan parameter conn
    if (m.isBaileys && m.fromMe) return 
    
    try {
        // Debug log
        console.log('Message received:', m.text)
        
        // Cek apakah chat dan user data tersedia
        if (!global.db.data.chats || !global.db.data.users) {
            console.log('Database not initialized')
            return !1
        }
        
        let chat = global.db.data.chats[m.chat]
        let user = global.db.data.users[m.sender]
        
        // Inisialisasi user jika belum ada
        if (!user) {
            global.db.data.users[m.sender] = {
                warn: 0
            }
            user = global.db.data.users[m.sender]
        }
        
        // Debug log
        console.log('Checking message:', m.text)
        console.log('Chat antiBadword setting:', chat?.antiBadword)
        
        let isBadword = badwordRegex.exec(m.text)
        
        if (chat?.antiBadword && isBadword && m.isGroup) {
            // Debug log
            console.log('Badword detected:', isBadword[0])
            
            // Increment warning
            user.warn = (user.warn || 0) + 1
            
            // Template pesan warning
            const warningMessage = `📛 *Kata Kata Toxic Terdeteksi*

YuLa Memberi Peringatan: ${user.warn} / 5

[❗] Jika *Tamaengs Bot* sudah memperingatkanmu sebanyak 5x. Kamu akan dikeluarkan dari group ini.

" チッ... タマエンさんがこう言うなら、覚悟しろよ... 黙れ！二度と悪口を言うな！

Tch... Tamaengs-san ga kou iu nara, kakugo shiro yo... Damare! Nido to waruguchi wo iu na!!`
            
            try {
                // Kirim pesan text dulu untuk memastikan bot berfungsi
                await m.reply(warningMessage)
                
                // Kemudian coba kirim dengan gambar
                await conn.sendMessage(m.chat, {
                    image: { url: './image1.jpg' },
                    caption: warningMessage,
                    fileLength: 99999999999999,
                    contextInfo: {
                        externalAdReply: {
                            title: 'Warning System',
                            body: 'Toxic Detection',
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: './image1.jpg',
                            sourceUrl: ''
                        }
                    }
                }).catch(err => {
                    console.error('Error sending image message:', err)
                    // Jika gagal kirim gambar, pesan text sudah terkirim di atas
                })
                
                // Debug log
                console.log('Warning message sent successfully')
                
                // Kick user if warnings >= 5
                if (user.warn >= 5) {
                    console.log('Attempting to kick user')
                    user.warn = 0
                    if (isBotAdmin) {
                        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                        console.log('User kicked successfully')
                    } else {
                        console.log('Bot is not admin, cannot kick user')
                    }
                }
            } catch (err) {
                console.error('Error in warning process:', err)
                // Kirim pesan simple jika semua cara gagal
                await m.reply('⚠️ Kata kasar terdeteksi! Peringatan ' + user.warn + '/5')
            }
        }
    } catch (err) {
        console.error('Error in before function:', err)
    }
    
    return !0
}