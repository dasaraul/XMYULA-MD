import path from 'path'
import {
	toAudio
} from './converter.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './exif.js';
import util from 'util'
import {
	fileTypeFromBuffer
} from 'file-type'
import {
	format
} from 'util'
import {
	fileURLToPath
} from 'url'
import store from './store.js'
import jimp from 'jimp';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @type {import('baileys')}
 */
const {
	default: _makeWaSocket,
	makeWALegacySocket,
	proto,
	downloadContentFromMessage,
	jidDecode,
	areJidsSameUser,
	generateForwardMessageContent,
	generateWAMessageFromContent,
	generateWAMessage,
	getDevice,
	WAMessageStubType,
	prepareWAMessageMedia,
	extractMessageContent
} = (await import('baileys')).default

const ephemeral = {
	ephemeralExpiration: 8600
}

export function makeWASocket(connectionOptions, options = {}) {
	/**
	 * @type {import('baileys').WASocket | import('baileys').WALegacySocket}
	 */
	let conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

	let sock = Object.defineProperties(conn, {
		chats: {
			value: {
				...(options.chats || {})
			},
			writable: true
		},
		decodeJid: {
			value(jid) {
				if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
				return jid.decodeJid()
			}
		},
		logger: {
			get() {
				return {
					info(...args) {
						console.log(
							chalk.bold.bgRgb(51, 204, 51)('INFO '),
							`[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
							chalk.cyan(format(...args))
						)
					},
					error(...args) {
						console.log(
							chalk.bold.bgRgb(247, 38, 33)('ERROR '),
							`[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
							chalk.rgb(255, 38, 0)(format(...args))
						)
					},
					warn(...args) {
						console.log(
							chalk.bold.bgRgb(255, 153, 0)('WARNING '),
							`[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
							chalk.redBright(format(...args))
						)
					},
					trace(...args) {
						console.log(
							chalk.grey('TRACE '),
							`[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
							chalk.white(format(...args))
						)
					},
					debug(...args) {
						console.log(
							chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
							`[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
							chalk.white(format(...args))
						)
					}
				}
			},
			enumerable: true
		},
		getFile: {
			/**
			 * getBuffer hehe
			 * @param {fs.PathLike} PATH 
			 * @param {Boolean} saveToFile
			 */
			async value(PATH, saveToFile = false) {
				let res, filename
				const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
				if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
				const type = await fileTypeFromBuffer(data) || {
					mime: 'application/octet-stream',
					ext: '.bin'
				}
				if (data && saveToFile && !filename)(filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
				return {
					res,
					filename,
					...type,
					data,
					deleteFile() {
						return filename && fs.promises.unlink(filename)
					}
				}
			},
			enumerable: true
		},
		waitEvent: {
			/**
			 * waitEvent
			 * @param {String} eventName 
			 * @param {Boolean} is 
			 * @param {Number} maxTries 
			 */
			value(eventName, is = () => true, maxTries = 25) { //Idk why this exist?
				return new Promise((resolve, reject) => {
					let tries = 0
					let on = (...args) => {
						if (++tries > maxTries) reject('Max tries reached')
						else if (is()) {
							conn.ev.off(eventName, on)
							resolve(...args)
						}
					}
					conn.ev.on(eventName, on)
				})
			}
		},
		resize: {
			/**
			 * Resize By Fokus ID
			 * @param {Buffer} buffer 
			 * @param {String|Number} uk1 
			 * @param {String|Number} uk2 
			 * @returns 
			 */
			value(buffer, uk1, uk2) {
				return new Promise(async (resolve, reject) => {
					let baper = await jimp.read(buffer);
					let result = await baper.resize(uk1, uk2).getBufferAsync(jimp.MIME_JPEG)
					resolve(result)
				})
			},
			enumerable: true
		},
		/*sendFile2: {
//			 * Send Media/File with Automatic Type Specifier
//			 * @param {String} jid
//			 * @param {String|Buffer} path
//			 * @param {String} filename
//			 * @param {String} caption
//			 * @param {import('baileys').proto.WebMessageInfo} quoted
//			 * @param {Boolean} ptt
//			 * @param {Object} options
			 
			async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
				let type = await conn.getFile(path, true)
				let {
					res,
					data: file,
					filename: pathFile
				} = type
				if (res && res.status !== 200 || file.length <= 65536) {
					try {
						throw {
							json: JSON.parse(file.toString())
						}
					} catch (e) {
						if (e.json) throw e.json
					}
				}
				const fileSize = fs.statSync(pathFile).size / 1024 / 1024
				if (fileSize >= 100) throw new Error('File size is too big!')
				let opt = {}
				if (quoted) opt.quoted = quoted
				if (!type) options.asDocument = true
				let mtype = '',
					mimetype = options.mimetype || type.mime,
					convert
				if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
				else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
				else if (/video/.test(type.mime)) mtype = 'video'
				else if (/audio/.test(type.mime))(
					convert = await toAudio(file, type.ext),
					file = convert.data,
					pathFile = convert.filename,
					mtype = 'audio',
					mimetype = options.mimetype || 'audio/ogg; codecs=opus'
				)
				else mtype = 'document'
				if (options.asDocument) mtype = 'document'

				delete options.asSticker
				delete options.asLocation
				delete options.asVideo
				delete options.asDocument
				delete options.asImage

				let message = {
					...options,
					caption,
					ptt,
					[mtype]: {
						url: pathFile
					},
					mimetype,
					fileName: filename || pathFile.split('/').pop()
				}
				
				 // @type {import('baileys').proto.WebMessageInfo}
				 
				let m
				try {
					m = await conn.sendMessage(jid, message, {
						...opt,
						...options,
						...ephemeral
					})
				} catch (e) {
					console.error(e)
					m = null
				} finally {
					if (!m) m = await conn.sendMessage(jid, {
						...message,
						[mtype]: file
					}, {
						...opt,
						...options,
						...ephemeral
					})
					file = null // releasing the memory
					return m
				}
			},
			enumerable: true
		},*/
		sendFile: {
			/**
			 * Mengirim Media/File dengan Penentu Tipe Otomatis
			 * @param {String} jid - ID tujuan (user/group)
			 * @param {String|Buffer} path - Path file atau buffer file
			 * @param {String} filename - Nama file (opsional)
			 * @param {String} caption - Caption untuk file (opsional)
			 * @param {import('baileys').proto.WebMessageInfo} quoted - Pesan yang di-reply (opsional)
			 * @param {Boolean} ptt - Push-to-talk (opsional, default: false)
			 * @param {Object} options - Opsi tambahan (opsional)
			 */
			async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
				try {
					// Mengambil file dan menentukan tipe MIME
					let type = await conn.getFile(path, true);
					let {
						res,
						data: file,
						filename: pathFile
					} = type;

					// Memeriksa respons dan ukuran file
					if ((res && res.status !== 200) || file.length <= 65536) {
						try {
							throw {
								json: JSON.parse(file.toString())
							};
						} catch (e) {
							if (e.json) throw e.json;
						}
					}

					// Memeriksa ukuran file (maksimal 100 MB)
					const fileSize = fs.statSync(pathFile).size / 1024 / 1024;
					if (fileSize >= 100) throw new Error('Ukuran file terlalu besar!');

					// Menyiapkan opsi untuk pesan yang di-reply
					let opt = {};
					if (quoted) opt.quoted = quoted;

					// Jika tipe file tidak terdeteksi, kirim sebagai dokumen
					if (!type) options.asDocument = true;

					// Menentukan tipe media (sticker, gambar, video, audio, dokumen)
					let mtype = '',
						mimetype = options.mimetype || type.mime,
						convert;
					if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) {
						mtype = 'sticker';
					} else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) {
						mtype = 'image';
					} else if (/video/.test(type.mime)) {
						mtype = 'video';
					} else if (/audio/.test(type.mime)) {
						// Konversi audio ke format yang sesuai
						try {
							convert = await toAudio(file, type.ext);
							file = convert.data;
							pathFile = convert.filename;
							mtype = 'audio';
							mimetype = options.mimetype || 'audio/mpeg';
						} catch (error) {
							console.error('Gagal mengonversi audio:', error);
							throw new Error('Gagal memproses file audio.');
						}
					} else {
						mtype = 'document';
					}

					// Jika opsi asDocument aktif, kirim sebagai dokumen
					if (options.asDocument) mtype = 'document';

					// Menghapus opsi yang tidak diperlukan
					delete options.asSticker;
					delete options.asLocation;
					delete options.asVideo;
					delete options.asDocument;
					delete options.asImage;

					// Membuat objek pesan
					let message = {
						...options,
						caption,
						ptt,
						[mtype]: {
							url: pathFile
						},
						mimetype,
						fileName: filename || pathFile.split('/').pop()
					};

					// Mengirim pesan
					let m;
					try {
						m = await conn.sendMessage(jid, message, {
							...opt,
							...options,
							...ephemeral
						});
					} catch (e) {
						console.error('Gagal mengirim pesan:', e);
						m = null;
					} finally {
						if (!m) {
							// Jika gagal, coba kirim ulang dengan file langsung
							m = await conn.sendMessage(jid, {
								...message,
								[mtype]: file
							}, {
								...opt,
								...options,
								...ephemeral
							});
						}
						file = null; // Membersihkan memori
						return m;
					}
				} catch (error) {
					console.error('Terjadi kesalahan dalam sendFile:', error);
					throw error;
				}
			},
			enumerable: true
		},
		sendKontak: {
			async value(jid, data, quoted, options) {
				if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
				let contacts = []
				for (let [number, nama, ponsel, email] of data) {
					number = number.replace(/[^0-9]/g, '')
					let njid = number + '@s.whatsapp.net'
					let name = global.db.data.users[njid] ? global.db.data.users[njid].name : conn.getName(njid)
					let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
					let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name.replace(/\n/g, '\\n')}
ORG:
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:📌 ${ponsel}
item2.EMAIL;type=INTERNET:${email}
item2.X-ABLabel:✉️ Email
X-WA-BIZ-DESCRIPTION:${(biz.description || '').replace(/\n/g, '\\n')}
X-WA-BIZ-NAME:${name.replace(/\n/g, '\\n')}
END:VCARD
`.trim()
					contacts.push({
						vcard,
						displayName: name
					})
				}
				return await conn.sendMessage(jid, {
					contacts: {
						...options,
						displayName: (contacts.length > 1 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
						contacts
					}
				}, {
					quoted,
					...options,
					...ephemeral
				})
			}
		},
		sendGroupV4Invite: {
			/**
			 * sendGroupV4Invite
			 * @param {String} jid 
			 * @param {*} participant 
			 * @param {String} inviteCode 
			 * @param {Number} inviteExpiration 
			 * @param {String} groupName 
			 * @param {String} caption 
			 * @param {Buffer} jpegThumbnail
			 * @param {*} options 
			 */
			async value(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', options = {}) {
				let msg = proto.Message.fromObject({
					groupInviteMessage: proto.GroupInviteMessage.fromObject({
						inviteCode,
						inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date + (3 * 86400000)),
						groupJid: jid,
						groupName: groupName ? groupName : this.getName(jid),
						caption
					})
				})
				let message = await this.prepareMessageFromContent(participant, msg, options)
				await this.relayWAMessage(message)
				return message
			},
			enumerable: true
		},
		sendButton: {
			/**
			 * send Button
			 * @param {String} jid
			 * @param {String} text
			 * @param {String} footer
			 * @param {Buffer} buffer
			 * @param {String[] | String[][]} buttons
			 * @param {import('baileys').proto.WebMessageInfo} quoted
			 * @param {Object} options
			 */
			async value(jid, text = '', footer = '', buffer, buttons, quoted, copy, urls, options = {}) {
				let file, isAndroid = await getDevice(quoted?.id) === 'android' ? true : false
				if (buffer) {
					try {
						file = await conn.getFile(buffer)
						// if not android, send normal message instead of button
						if (!isAndroid) return await conn.sendFile(jid, buffer, '', text, quoted, false, options)
						else buffer = await prepareWAMessageMedia({
							[/image/.test(file.mime) ? 'image' :
								'video'
							]: file.data
						}, {
							upload: conn.waUploadToServer
						})
					} catch (e) {
						console.error(e)
						file = buffer = null
					}
				} else {
					if (!isAndroid) return await conn.reply(jid, text, quoted)
				}
				if (!Array.isArray(buttons[0]) && typeof buttons[0] === 'string') buttons = [buttons]
				if (!options) options = {}
				const newbtns = buttons.map(btn => btn[2] == 'cta_copy' ? {
					name: 'cta_copy',
					buttonParamsJson: JSON.stringify({
						display_text: btn[0],
						copy_code: btn[1]
					})
				} : isURL(btn[1]) ? {
					name: 'cta_url',
					buttonParamsJson: JSON.stringify({
						display_text: btn[0],
						url: btn[1],
						merchant_url: btn[1]
					})
				} : {
					name: 'quick_reply',
					buttonParamsJson: JSON.stringify({
						display_text: btn[0],
						id: btn[1]
					}),
				});
				const mime = /image/.test(file?.mime || '') ? 'imageMessage' : 'videoMessage'
				const interactiveMessage = {
					body: {
						text: text
					},
					footer: {
						text: footer
					},
					header: {
						hasMediaAttachment: false,
						[mime]: buffer ? buffer[mime] : null
					},
					nativeFlowMessage: {
						buttons: newbtns,
						messageParamsJson: ''
					}
				}
				let msgL = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message: {
							interactiveMessage
						}
					}
				}, {
					ephemeralExpiration: 86400,
					userJid: conn.user.jid,
					quoted
				})
				return await conn.relayMessage(jid, msgL.message, {
					messageId: msgL.key.id,
					...options
				})
			},
			enumerable: true,
			writable: true,
		},
		sendButtonSlide: {
			/**
			 * send Carousel Message
			 * @param {String} jid
			 * @param {String} text
			 * @param {String} footer
			 * @param {Array} slides
			 * @param {Object} options
			 */
			async value(jid, text = '', footer = '', slides, quoted, options = {}) {
				const isAndroid = await getDevice(quoted?.id) === 'android' ? true : false
				const pr = await proto.Message.InteractiveMessage
				const array = []
				for (let [txt, ftr, header, thumbnailUrl, buttons] of slides.slice(0, 7)) {
					if (!isAndroid) return await conn.sendButton(jid, txt, footer, thumbnailUrl, buttons, quoted)
					try {
						const mediaMessage = await prepareWAMessageMedia({
							[/\.mp4/i.test(thumbnailUrl) ? 'video' : 'image']: {
								url: thumbnailUrl
							}
						}, {
							upload: conn.waUploadToServer
						});
						await array.push({
							body: pr.Body.fromObject({
								text: txt
							}),
							footer: pr.Footer.fromObject({
								text: ftr
							}),
							header: pr.Header.create({
								title: header,
								subtitle: '',
								hasMediaAttachment: true,
								...mediaMessage
							}),
							nativeFlowMessage: pr.NativeFlowMessage.fromObject({
								buttons: buttons.map(([display_text, btn, name]) => name == 'cta_copy' ? {
									name,
									buttonParamsJson: JSON.stringify({
										display_text,
										copy_code: btn
									})
								} : name == 'cta_url' ? {
									name,
									buttonParamsJson: JSON.stringify({
										display_text,
										url: btn,
										merchant_url: btn
									})
								} : { // 'quick_reply'
									name,
									buttonParamsJson: JSON.stringify({
										display_text,
										id: btn
									}),
								})
							})
						});
					} catch (e) {
						console.error('Error preparing media message for :' + txt, e);
					}
				}
				const msg = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadata: {},
								deviceListMetadataVersion: 2
							},
							interactiveMessage: pr.fromObject({
								body: pr.Body.create({
									text
								}),
								footer: pr.Footer.create({
									text: footer
								}),
								header: pr.Header.create({
									hasMediaAttachment: false
								}),
								carouselMessage: pr.CarouselMessage.fromObject({
									cards: array
								})
							})
						}
					}
				}, {
					quoted,
					ephemeralExpiration: 86400
				});
				await conn.relayMessage(jid, msg.message, {
					messageId: msg.key.id
				});
			},
			enumerable: true,
			writable: true,
		},
		sendButtonList: {
			async value(jid, title, text, footer, buttonText, buffer, listSections, quoted, options = {}) {
				let file
				if (buffer) {
					try {
						file = await conn.getFile(buffer)
						buffer = await prepareWAMessageMedia({
							[/image/.test(file.mime) ? 'image' :
								'video'
							]: file.data
						}, {
							upload: conn.waUploadToServer
						})
					} catch (e) {
						console.error(e)
						file = buffer = null
					}
				}
				if (!/image|video/.test(file?.mime || '')) file = buffer = null
				// send a list message!
				const sections = listSections.map(([title, rows]) => ({
					title: !nullish(title) && title || !nullish(rowTitle) && rowTitle || '',
					highlight_label: '',
					rows: rows.map(([rowTitle, rowId, description]) => ({
						header: '',
						title: !nullish(rowTitle) && rowTitle || !nullish(rowId) && rowId || '',
						id: !nullish(rowId) && rowId || !nullish(rowTitle) && rowTitle || '',
						description: !nullish(description) && description || ''
					}))
				}))
				const mime = /image/.test(file?.mime || '') ? 'imageMessage' : 'videoMessage'
				const message = {
					interactiveMessage: {
						header: {
							title: title,
							hasMediaAttachment: false,
							[mime]: buffer ? buffer[mime] : null
						},
						body: {
							text
						},
						footer: {
							text: footer
						},
						nativeFlowMessage: {
							buttons: [{
								name: 'single_select',
								buttonParamsJson: JSON.stringify({
									title: buttonText,
									sections
								})
							}],
							messageParamsJson: ''
						},
						contextInfo: {
							mentionedJid: conn.parseMention(text),
							forwardingScore: 999,
							isForwarded: true,
							forwardedNewsletterMessageInfo: {
								newsletterJid: global.info.channel,
								newsletterName: global.info.namechannel,
								serverMessageId: 143
							}
						}
					}
				};
				let msgs = generateWAMessageFromContent(jid, {
					viewOnceMessage: {
						message
					}
				}, {
					userJid: conn.user.jid,
					quoted
				})
				return await conn.relayMessage(jid, msgs.message, {
					messageId: msgs.key.id,
					...options
				})
			}
		},
		sendContact: {
			/**
			 * Send Contact
			 * @param {String} jid 
			 * @param {String[][]|String[]} data
			 * @param {import('baileys').proto.WebMessageInfo} quoted 
			 * @param {Object} options 
			 */
			async value(jid, data, quoted, options) {
				if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
				let contacts = []
				for (let [number, name] of data) {
					number = number.replace(/[^0-9]/g, '')
					let njid = number + '@s.whatsapp.net'
					let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
					let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
`.trim()
					contacts.push({
						vcard,
						displayName: name
					})
				}
				return await conn.sendMessage(jid, {
					...options,
					contacts: {
						...options,
						displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
						contacts
					}
				}, {
					quoted,
					...options,
					...ephemeral
				})
			},
			enumerable: true
		},
		reply: {
			/**
			 * Reply to a message
			 * @param {String} jid
			 * @param {String|Buffer} text
			 * @param {import('baileys').proto.WebMessageInfo} quoted
			 * @param {Object} options
			 */
			value(jid, text = '', quoted, options) {
				return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, {
					...options,
					text
				}, {
					quoted,
					...options,
					...ephemeral
				})
			}
		},
		adReply: {
			async value(jid, text, title = '', body = '', buffer, source = '', quoted, options) {
				let {
					data
				} = await conn.getFile(buffer, true)
				return conn.sendMessage(jid, {
					text: text,
					contextInfo: {
						mentionedJid: await conn.parseMention(text),
						externalAdReply: {
							showAdAttribution: true,
							mediaType: 1,
							title: title,
							body: body,
							thumbnail: data,
							renderLargerThumbnail: true,
							mediaUrl: hwaifu.getRandom(),
							sourceUrl: source
						}
					}
				}, {
					quoted: quoted,
					...options,
					...ephemeral
				})
			},
			enumerable: true
		},
		preSudo: {
			async value(text, who, m, chatupdate) {
				let messages = await generateWAMessage(m.chat, {
					text,
					mentions: await conn.parseMention(text)
				}, {
					userJid: who,
					quoted: m.quoted && m.quoted.fakeObj
				})
				messages.key.fromMe = areJidsSameUser(who, conn.user.id)
				messages.key.id = m.key.id
				messages.pushName = m.name
				if (m.isGroup) messages.key.participant = messages.participant = who
				let msg = {
					...chatupdate,
					messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => ((v.conn = this), v)),
					type: "append"
				}
				return msg
			}
		},
		sendReact: {
			async value(jid, text, key) {
				return conn.sendMessage(jid, {
					react: {
						text: text,
						key: key
					}
				});
			}
		},
		delay: {
			async value(ms) {
				return new Promise((resolve, reject) => setTimeout(resolve, ms))
			}
		},
		cMod: {
			/**
			 * cMod
			 * @param {String} jid 
			 * @param {import('baileys').proto.WebMessageInfo} message 
			 * @param {String} text 
			 * @param {String} sender 
			 * @param {*} options 
			 * @returns 
			 */
			value(jid, message, text = '', sender = conn.user.jid, options = {}) {
				if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions]
				let copy = message.toJSON()
				delete copy.message.messageContextInfo
				delete copy.message.senderKeyDistributionMessage
				let mtype = Object.keys(copy.message)[0]
				let msg = copy.message
				let content = msg[mtype]
				if (typeof content === 'string') msg[mtype] = text || content
				else if (content.caption) content.caption = text || content.caption
				else if (content.text) content.text = text || content.text
				if (typeof content !== 'string') {
					msg[mtype] = {
						...content,
						...options,
						...ephemeral
					}
					msg[mtype].contextInfo = {
						...(content.contextInfo || {}),
						mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
					}
				}
				if (copy.participant) sender = copy.participant = sender || copy.participant
				else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
				if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
				else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
				copy.key.remoteJid = jid
				copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false
				return proto.WebMessageInfo.fromObject(copy)
			},
			enumerable: true
		},
		copyNForward: {
			/**
			 * Exact Copy Forward
			 * @param {String} jid
			 * @param {import('baileys').proto.WebMessageInfo} message
			 * @param {Boolean|Number} forwardingScore
			 * @param {Object} options
			 */
			async value(jid, message, forwardingScore = true, options = {}) {
				let vtype
				if (options.readViewOnce && message.message.viewOnceMessage?.message) {
					vtype = Object.keys(message.message.viewOnceMessage.message)[0]
					delete message.message.viewOnceMessage.message[vtype].viewOnce
					message.message = proto.Message.fromObject(
						JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
					)
					message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
				}
				let mtype = Object.keys(message.message)[0]
				let m = generateForwardMessageContent(message, !!forwardingScore)
				let ctype = Object.keys(m)[0]
				if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
				m[ctype].contextInfo = {
					...(message.message[mtype].contextInfo || {}),
					...(m[ctype].contextInfo || {})
				}
				m = generateWAMessageFromContent(jid, m, {
					...options,
					userJid: conn.user.jid
				})
				await conn.relayMessage(jid, m.message, {
					messageId: m.key.id,
					additionalAttributes: {
						...options
					}
				})
				return m
			},
			enumerable: true
		},
		fakeReply: {
			/**
			 * Fake Replies
			 * @param {String} jid
			 * @param {String|Object} text
			 * @param {String} fakeJid
			 * @param {String} fakeText
			 * @param {String} fakeGroupJid
			 * @param {String} options
			 */
			value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
				return conn.reply(jid, text, {
					key: {
						fromMe: areJidsSameUser(fakeJid, conn.user.id),
						participant: fakeJid,
						...(fakeGroupJid ? {
							remoteJid: fakeGroupJid
						} : {})
					},
					message: {
						conversation: fakeText
					},
					...options
				})
			}
		},
		downloadM: {
			/**
			 * Download media message
			 * @param {Object} m
			 * @param {String} type
			 * @param {fs.PathLike | fs.promises.FileHandle} saveToFile
			 * @returns {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>}
			 */
			async value(m, type, saveToFile) {
				let filename
				if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
				const stream = await downloadContentFromMessage(m, type)
				let buffer = Buffer.from([])
				for await (const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				if (saveToFile)({
					filename
				} = await conn.getFile(buffer, true))
				return saveToFile && fs.existsSync(filename) ? filename : buffer
			},
			enumerable: true
		},
		parseMention: {
			/**
			 * Parses string into mentionedJid(s)
			 * @param {String} text
			 * @returns {Array<String>}
			 */
			value(text = '') {
				return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
			},
			enumerable: true
		},
		getName: {
			/**
			 * Get name from jid
			 * @param {String} jid
			 * @param {Boolean} withoutContact
			 */
			value(jid = '', withoutContact = false) {
				jid = conn.decodeJid(jid)
				withoutContact = conn.withoutContact || withoutContact
				let v
				if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
					v = conn.chats[jid] || {}
					if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {}
					resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
				})
				else v = jid === '0@s.whatsapp.net' ? {
						jid,
						vname: 'WhatsApp'
					} : areJidsSameUser(jid, conn.user.id) ?
					conn.user :
					(conn.chats[jid] || {})
				return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
			},
			enumerable: true
		},
		loadMessage: {
			/**
			 * 
			 * @param {String} messageID 
			 * @returns {import('baileys').proto.WebMessageInfo}
			 */
			value(messageID) {
				return Object.entries(conn.chats)
					.filter(([_, {
						messages
					}]) => typeof messages === 'object')
					.find(([_, {
							messages
						}]) => Object.entries(messages)
						.find(([k, v]) => (k === messageID || v.key?.id === messageID)))
					?.[1].messages?.[messageID]
			},
			enumerable: true
		},
		relayWAMessage: {
			async value(pesanfull) {
				if (pesanfull.message.audioMessage) {
					await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid)
				} else {
					await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid)
				}
				var mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, {
					messageId: pesanfull.key.id
				})
				conn.ev.emit('messages.upsert', {
					messages: [pesanfull],
					type: 'append'
				});
				return mekirim
			}
		},
		processMessageStubType: {
			/**
			 * to process MessageStubType
			 * @param {import('baileys').proto.WebMessageInfo} m 
			 */
			async value(m) {
				if (!m.messageStubType) return
				const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
				if (!chat || chat === 'status@broadcast') return
				const emitGroupUpdate = (update) => {
					conn.ev.emit('groups.update', [{
						id: chat,
						...update
					}])
				}
				switch (m.messageStubType) {
					case WAMessageStubType.REVOKE:
					case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
						emitGroupUpdate({
							revoke: m.messageStubParameters?.[0]
						})
						break
					case WAMessageStubType.GROUP_CHANGE_ICON:
						emitGroupUpdate({
							icon: m.messageStubParameters?.[0]
						})
						break
					default: {
						console.log({
							messageStubType: m.messageStubType,
							messageStubParameters: m.messageStubParameters,
							type: WAMessageStubType[m.messageStubType]
						})
						break
					}
				}
				const isGroup = chat.endsWith('@g.us')
				if (!isGroup) return
				let chats = conn.chats[chat]
				if (!chats) chats = conn.chats[chat] = {
					id: chat
				}
				chats.isChats = true
				const metadata = await conn.groupMetadata(chat).catch(_ => null)
				if (!metadata) return
				chats.subject = metadata.subject
				chats.metadata = metadata
			}
		},
		insertAllGroup: {
			async value() {
				const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {}
				for (const group in groups) conn.chats[group] = {
					...(conn.chats[group] || {}),
					id: group,
					subject: groups[group].subject,
					isChats: true,
					metadata: groups[group]
				}
				return conn.chats
			},
		},
		pushMessage: {
			/**
			 * pushMessage
			 * @param {import('baileys').proto.WebMessageInfo[]} m 
			 */
			async value(m) {
				if (!m) return
				if (!Array.isArray(m)) m = [m]
				for (const message of m) {
					try {
						// if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f
						if (!message) continue
						if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error)
						const _mtype = Object.keys(message.message || {})
						const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
							(_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
							_mtype[_mtype.length - 1]
						const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
						if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
							/**
							 * @type {import('baileys').proto.IContextInfo}
							 */
							let context = message.message[mtype].contextInfo
							let participant = conn.decodeJid(context.participant)
							const remoteJid = conn.decodeJid(context.remoteJid || participant)
							/**
							 * @type {import('baileys').proto.IMessage}
							 * 
							 */
							let quoted = message.message[mtype].contextInfo.quotedMessage
							if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
								let qMtype = Object.keys(quoted)[0]
								if (qMtype == 'conversation') {
									quoted.extendedTextMessage = {
										text: quoted[qMtype]
									}
									delete quoted.conversation
									qMtype = 'extendedTextMessage'
								}
								if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
								quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
								const isGroup = remoteJid.endsWith('g.us')
								if (isGroup && !participant) participant = remoteJid
								const qM = {
									key: {
										remoteJid,
										fromMe: areJidsSameUser(conn.user.jid, remoteJid),
										id: context.stanzaId,
										participant,
									},
									message: JSON.parse(JSON.stringify(quoted)),
									...(isGroup ? {
										participant
									} : {})
								}
								let qChats = conn.chats[participant]
								if (!qChats) qChats = conn.chats[participant] = {
									id: participant,
									isChats: !isGroup
								}
								if (!qChats.messages) qChats.messages = {}
								if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
								let qChatsMessages
								if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) // maybe avoid memory leak
							}
						}
						if (!chat || chat === 'status@broadcast') continue
						const isGroup = chat.endsWith('@g.us')
						let chats = conn.chats[chat]
						if (!chats) {
							if (isGroup) await conn.insertAllGroup().catch(console.error)
							chats = conn.chats[chat] = {
								id: chat,
								isChats: true,
								...(conn.chats[chat] || {})
							}
						}
						let metadata, sender
						if (isGroup) {
							if (!chats.subject || !chats.metadata) {
								metadata = await conn.groupMetadata(chat).catch(_ => ({})) || {}
								if (!chats.subject) chats.subject = metadata.subject || ''
								if (!chats.metadata) chats.metadata = metadata
							}
							sender = conn.decodeJid(message.key?.fromMe && conn.user.id || message.participant || message.key?.participant || chat || '')
							if (sender !== chat) {
								let chats = conn.chats[sender]
								if (!chats) chats = conn.chats[sender] = {
									id: sender
								}
								if (!chats.name) chats.name = message.pushName || chats.name || ''
							}
						} else if (!chats.name) chats.name = message.pushName || chats.name || ''
						if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
						chats.isChats = true
						if (!chats.messages) chats.messages = {}
						const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id)
						if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
							delete message.message.messageContextInfo
							delete message.message.senderKeyDistributionMessage
							chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
							let chatsMessages
							if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
						}
					} catch (e) {
						console.error(e)
					}
				}
			}
		},
	    sendStickerImage: {
	    async value(jid, path, quoted, options = {}) {
		let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
		let buffer
		if (options && (options.packname || options.author)) {
			buffer = await writeExifImg(buff, options)
		} else {
			buffer = await imageToWebp(buff)
		}
		await conn.sendMessage(jid, {
			sticker: {
				url: buffer
			},
			...options
		}, {
			quoted
		})
		return buffer
		}
	},
	sendStickerVideo: {
	    async value(jid, path, quoted, options = {}) {
		let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
		let buffer
		if (options && (options.packname || options.author)) {
			buffer = await writeExifVid(buff, options)
		} else {
			buffer = await videoToWebp(buff)
		}
		await conn.sendMessage(jid, {
			sticker: {
				url: buffer
			},
			...options
		}, {
			quoted
		})
		return buffer
		}
	},
		serializeM: {
			/**
			 * Serialize Message, so it easier to manipulate
			 * @param {import('baileys').proto.WebMessageInfo} m
			 */
			value(m) {
				return smsg(conn, m)
			}
		},
		...(typeof conn.chatRead !== 'function' ? {
			chatRead: {
				/**
				 * Read message
				 * @param {String} jid 
				 * @param {String|undefined|null} participant 
				 * @param {String} messageID 
				 */

				value(jid, participant = conn.user.jid, messageID) {
					return conn.sendReadReceipt(jid, participant, [messageID])
				},
				enumerable: true
			}
		} : {}),
		...(typeof conn.setStatus !== 'function' ? {
			setStatus: {
				/**
				 * setStatus bot
				 * @param {String} status 
				 */
				value(status) {
					return conn.query({
						tag: 'iq',
						attrs: {
							to: S_WHATSAPP_NET,
							type: 'set',
							xmlns: 'status',
						},
						content: [{
							tag: 'status',
							attrs: {},
							content: Buffer.from(status, 'utf-8')
						}]
					})
				},
				enumerable: true
			}
		} : {})
	})
	if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id)
	store.bind(sock)
	return sock
}
/**
 * Serialize Message
 * @param {ReturnType<typeof makeWASocket>} conn 
 * @param {import('baileys').proto.WebMessageInfo} m 
 * @param {Boolean} hasParent 
 */
export function smsg(conn, m, hasParent) {
	if (!m) return m
	/**
	 * @type {import('baileys').proto.WebMessageInfo}
	 */
	let M = proto.WebMessageInfo
	m = M.fromObject(m)
	m.conn = conn
	let protocolMessageKey
	if (m.message) {
		if (m.mtype == 'protocolMessage' && m.msg.key) {
			protocolMessageKey = m.msg.key
			if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
			if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
			protocolMessageKey.fromMe = conn.decodeJid(protocolMessageKey.participant) === conn.decodeJid(conn.user.id)
			if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === conn.decodeJid(conn.user.id)) protocolMessageKey.remoteJid = m.sender
		}
		if (m?.quoted)
			if (!m.quoted.mediaMessage) delete m.quoted.download
	}
	if (!m.mediaMessage) delete m.download

	try {
		if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', protocolMessageKey)
	} catch (e) {
		console.error(e)
	}
	return m
}

// https://github.com/Nurutomo/wabot-aq/issues/490
export function serialize() {
	const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
	return Object.defineProperties(proto.WebMessageInfo.prototype, {
		conn: {
			value: undefined,
			enumerable: false,
			writable: true
		},
		id: {
			get() {
				return this.key?.id
			}
		},
		isBaileys: {
			get() {
				return this.id?.startsWith('3EB0') && this.id?.length === 22
			},
			enumerable: true
		},
		chat: {
			get() {
				const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
				return (
					this.key?.remoteJid ||
					(senderKeyDistributionMessage &&
						senderKeyDistributionMessage !== 'status@broadcast'
					) || ''
				).decodeJid()
			}
		},
		isGroup: {
			get() {
				return this.chat.endsWith('@g.us')
			},
			enumerable: true
		},
		sender: {
			get() {
				return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '')
			},
			enumerable: true
		},
		fromMe: {
			get() {
				return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false
			}
		},
		mtype: {
			get() {
				if (!this.message) return ''
				const type = Object.keys(this.message)
				return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || // Sometimes message in the front
					(type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || // Sometimes message in midle if mtype length is greater than or equal to 3
					type[type.length - 1] // common case
			},
			enumerable: true
		},
		msg: {
			get() {
				if (!this.message) return null
				return this.message[this.mtype]
			}
		},
		mediaMessage: {
			get() {
				if (!this.message) return null
				const Message = ((this.msg?.url || this.msg?.directPath) ? {
					...this.message
				} : extractMessageContent(this.message)) || null
				if (!Message) return null
				const mtype = Object.keys(Message)[0]
				return MediaType.includes(mtype) ? Message : null
			},
			enumerable: true
		},

		mediaType: {
			get() {
				let message
				if (!(message = this.mediaMessage)) return null
				return Object.keys(message)[0]
			},
			enumerable: true,
		},
		quoted: {
			get() {
				/**
				 * @type {ReturnType<typeof makeWASocket>}
				 */
				const self = this
				const msg = self.msg
				const contextInfo = msg?.contextInfo
				const quoted = contextInfo?.quotedMessage
				if (!msg || !contextInfo || !quoted) return null
				const type = Object.keys(quoted)[0]
				let q = quoted[type] || {}
				const text = typeof q === 'string' ? q : q.text
				return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? {
					text: q
				} : q)), {
					mtype: {
						get() {
							return type
						},
						enumerable: true
					},
					mediaMessage: {
						get() {
							const Message = ((q.url || q.directPath) ? {
								...quoted
							} : extractMessageContent(quoted)) || null
							if (!Message) return null
							const mtype = Object.keys(Message)[0]
							return MediaType.includes(mtype) ? Message : null
						},
						enumerable: true
					},
					mediaType: {
						get() {
							let message
							if (!(message = this.mediaMessage)) return null
							return Object.keys(message)[0]
						},
						enumerable: true,
					},
					id: {
						get() {
							return contextInfo.stanzaId
						},
						enumerable: true
					},
					chat: {
						get() {
							return contextInfo.remoteJid || self.chat
						},
						enumerable: true
					},
					isBaileys: {
						get() {
							return this.id?.startsWith('3EB0') && this.id?.length === 22
						},
						enumerable: true
					},
					sender: {
						get() {
							return (contextInfo.participant || this.chat || '').decodeJid()
						},
						enumerable: true
					},
					fromMe: {
						get() {
							return areJidsSameUser(this.sender, self.conn?.user.jid)
						},
						enumerable: true,
					},
					text: {
						get() {
							return text || this.caption || this.contentText || this.selectedDisplayText || ''
						},
						enumerable: true
					},
					mentionedJid: {
						get() {
							return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
						},
						enumerable: true
					},
					name: {
						get() {
							const sender = this.sender
							return sender ? self.conn?.getName(sender) : null
						},
						enumerable: true

					},
					vM: {
						get() {
							return proto.WebMessageInfo.fromObject({
								key: {
									fromMe: this.fromMe,
									remoteJid: this.chat,
									id: this.id
								},
								message: quoted,
								...(self.isGroup ? {
									participant: this.sender
								} : {})
							})
						}
					},
					fakeObj: {
						get() {
							return this.vM
						}
					},
					download: {
						value(saveToFile = false) {
							const mtype = this.mediaType
							return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
						},
						enumerable: true,
						configurable: true,
					},
					reply: {
						/**
						 * Reply to quoted message
						 * @param {String|Object} text
						 * @param {String|false} chatId
						 * @param {Object} options
						 */
						value(text, chatId, options) {
							return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options)
						},
						enumerable: true,
					},
					copy: {
						/**
						 * Copy quoted message
						 */
						value() {
							const M = proto.WebMessageInfo
							return smsg(conn, M.fromObject(M.toObject(this.vM)))
						},
						enumerable: true,
					},
					forward: {
						/**
						 * Forward quoted message
						 * @param {String} jid
						 *  @param {Boolean} forceForward
						 */
						value(jid, force = false, options) {
							return self.conn?.sendMessage(jid, {
								forward: this.vM,
								force,
								...options
							}, {
								...options
							})
						},
						enumerable: true,
					},
					copyNForward: {
						/**
						 * Exact Forward quoted message
						 * @param {String} jid
						 * @param {Boolean|Number} forceForward
						 * @param {Object} options
						 */
						value(jid, forceForward = false, options) {
							return self.conn?.copyNForward(jid, this.vM, forceForward, options)
						},
						enumerable: true,

					},
					cMod: {
						/**
						 * Modify quoted Message
						 * @param {String} jid
						 * @param {String} text
						 * @param {String} sender
						 * @param {Object} options
						 */
						value(jid, text = '', sender = this.sender, options = {}) {
							return self.conn?.cMod(jid, this.vM, text, sender, options)
						},
						enumerable: true,

					},
					delete: {
						/**
						 * Delete quoted message
						 */
						value() {
							return self.conn?.sendMessage(this.chat, {
								delete: this.vM.key
							})
						},
						enumerable: true,

					}
				})
			},
			enumerable: true
		},
		_text: {
			value: null,
			writable: true,
		},
		text: {
			get() {
				const msg = this.msg
				const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
				return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
					text?.selectedDisplayText ||
					text?.hydratedTemplate?.hydratedContentText ||
					text
				)) || ''
			},
			set(str) {
				return this._text = str
			},
			enumerable: true
		},
		mentionedJid: {
			get() {
				return this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || []
			},
			enumerable: true
		},
		name: {
			get() {
				return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
			},
			enumerable: true
		},
		download: {
			value(saveToFile = false) {
				const mtype = this.mediaType
				return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
			},
			enumerable: true,
			configurable: true
		},
		reply: {
			value(text, chatId, options) {
				return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
			}
		},
		copy: {
			value() {
				const M = proto.WebMessageInfo
				return smsg(this.conn, M.fromObject(M.toObject(this)))
			},
			enumerable: true
		},
		forward: {
			value(jid, force = false, options = {}) {
				return this.conn?.sendMessage(jid, {
					forward: this,
					force,
					...options
				}, {
					...options
				})
			},
			enumerable: true
		},
		copyNForward: {
			value(jid, forceForward = false, options = {}) {
				return this.conn?.copyNForward(jid, this, forceForward, options)
			},
			enumerable: true
		},
		cMod: {
			value(jid, text = '', sender = this.sender, options = {}) {
				return this.conn?.cMod(jid, this, text, sender, options)
			},
			enumerable: true
		},
		getQuotedObj: {
			value() {
				if (!this.quoted.id) return null
				const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
				return smsg(this.conn, q)
			},
			enumerable: true
		},
		getQuotedMessage: {
			get() {
				return this.getQuotedObj
			}
		},
		delete: {
			value() {
				return this.conn?.sendMessage(this.chat, {
					delete: this.key
				})
			},
			enumerable: true
		}
	})
}

export function logic(check, inp, out) {
	if (inp.length !== out.length) throw new Error('Input and Output must have same length')
	for (let i in inp)
		if (util.isDeepStrictEqual(check, inp[i])) return out[i]
	return null
}

export function protoType() {
	Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
		const ab = new ArrayBuffer(this.length);
		const view = new Uint8Array(ab);
		for (let i = 0; i < this.length; ++i) {
			view[i] = this[i];
		}
		return ab;
	}
	/**
	 * @returns {ArrayBuffer}
	 */
	Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
		return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
	}
	/**
	 * @returns {Buffer}
	 */
	ArrayBuffer.prototype.toBuffer = function toBuffer() {
		return Buffer.from(new Uint8Array(this))
	}
	// /**
	//  * @returns {String}
	//  */
	// Buffer.prototype.toUtilFormat = ArrayBuffer.prototype.toUtilFormat = Object.prototype.toUtilFormat = Array.prototype.toUtilFormat = function toUtilFormat() {
	//     return util.format(this)
	// }
	Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
		return await fileTypeFromBuffer(this)
	}
	/**
	 * @returns {Boolean}
	 */
	String.prototype.isNumber = Number.prototype.isNumber = isNumber
	/**
	 * 
	 * @returns {String}
	 */
	String.prototype.capitalize = function capitalize() {
		return this.charAt(0).toUpperCase() + this.slice(1, this.length)
	}
	/**
	 * @returns {String}
	 */
	String.prototype.capitalizeV2 = function capitalizeV2() {
		const str = this.split(' ')
		return str.map(v => v.capitalize()).join(' ')
	}
	String.prototype.decodeJid = function decodeJid() {
		if (/:\d+@/gi.test(this)) {
			const decode = jidDecode(this) || {}
			return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
		} else return this.trim()
	}
	/**
	 * number must be milliseconds
	 * @returns {string}
	 */
	Number.prototype.toTimeString = function toTimeString() {
		// const milliseconds = this % 1000
		const seconds = Math.floor((this / 1000) % 60)
		const minutes = Math.floor((this / (60 * 1000)) % 60)
		const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
		const days = Math.floor((this / (24 * 60 * 60 * 1000)))
		return (
			(days ? `${days} day(s) ` : '') +
			(hours ? `${hours} hour(s) ` : '') +
			(minutes ? `${minutes} minute(s) ` : '') +
			(seconds ? `${seconds} second(s)` : '')
		).trim()
	}
	Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}

function isURL(string) {
	try {
		new URL(string);
		return true;
	} catch (err) {
		return false;
	}
}

function isNumber() {
	const int = parseInt(this)
	return typeof int === 'number' && !isNaN(int)
}

function getRandom() {
	if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
	return Math.floor(Math.random() * this)
}


/**
 * ??
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 * @returns {boolean}
 */
function nullish(args) {
	return !(args !== null && args !== undefined)
}


// TypeError: Cannot read properties of null (reading 'user')
//     at WebMessageInfo.get (file:///home/container/lib/120363042986874411@g.us.js:888:70)
//     at Object.value (file:///home/container/lib/simple.js:731:61)
//     at Object.handler (file:///home/container/handler.js?update=1646537086773:18:10)
//     at EventEmitter.emit (node:events:532:35)
//     at Object.all (file:///home/container/plugins/_templateResponse.js?update=1646538543307:79:13)
//     at async Object.handler (file:///home/container/handler.js?update=1646537086773:346:21)