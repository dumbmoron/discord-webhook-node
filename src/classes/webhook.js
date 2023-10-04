const { sendWebhook, sendFile } = require('../api')
const MessageBuilder = require('./messageBuilder')

module.exports = class Webhook {
    constructor(url) {
        this.payload = {}
        this.hookURL = url
    }

    setUsername(username) {
        this.payload.username = username
        return this
    }

    setAvatar(avatarURL) {
        this.payload.avatar_url = avatarURL
        return this
    }

    async sendFile(filePath) {
        const res = await sendFile(this.hookURL, filePath, this.payload)

        if (res.status != 200)
            throw new Error(`Error sending webhook: ${res.status} status code.`)
    }

    async send(payload) {
        let endPayload = {
            ...this.payload
        }

        if (typeof payload === 'string')
            endPayload.content = payload
        else
            endPayload = {
                ...endPayload,
                ...payload.getJSON()
            }

        const res = await sendWebhook(this.hookURL, endPayload)

        if (res.status == 429) {
            const body = await res.json()
            const waitUntil = body.retry_after

            setTimeout(() => sendWebhook(this.hookURL, endPayload), waitUntil)
        } else if (res.status != 204) {
            throw new Error(`Error sending webhook: ${res.status} status code. Response: ${await res.text()}`)
        }
    }

    async info(title, fieldName, fieldValue, inline) {
        const embed = new MessageBuilder()
                        .setTitle(title)
                        .setTimestamp()
                        .setColor(0x3d9cad)

        if (fieldName != undefined && fieldValue != undefined) {
            embed.addField(fieldName, fieldValue, inline)
        }

        await this.send(embed)
    }

    async success(title, fieldName, fieldValue, inline) {
        const embed = new MessageBuilder()
                        .setTitle(title)
                        .setTimestamp()
                        .setColor(0x00ff3c)

        if (fieldName != undefined && fieldValue != undefined)
            embed.addField(fieldName, fieldValue, inline)

        await this.send(embed)
    }
    
    async warning(title, fieldName, fieldValue, inline) {
        const embed = new MessageBuilder()
                        .setTitle(title)
                        .setTimestamp()
                        .setColor(0xffcc00)

        if (fieldName != undefined && fieldValue != undefined)
            embed.addField(fieldName, fieldValue, inline)

        await this.send(embed)
    }


    async error(title, fieldName, fieldValue, inline) {
        const embed = new MessageBuilder()
                        .setTitle(title)
                        .setTimestamp()
                        .setColor(0xff443d)

        if (fieldName != undefined && fieldValue != undefined)
            embed.addField(fieldName, fieldValue, inline)

        await this.send(embed)
    }

}
