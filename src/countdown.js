import { Embed } from "@discordjs/builders"
import { Message } from "discord.js";

export class CountDown {
    /**
     * 
     * @param {*} embed 
     * @param {*} lesson 
     * @param {Message} message 
     */
    constructor(embed, lesson, message) {
        this.embed = embed;
        this.lesson = lesson
        this.message = message
    }

    /**
     * 
     * @param {import("discord.js").GuildBasedChannel} channel 
     * @param {Object} lesson 
     * @returns CountDown
     */
    static async makeCountDown(channel, lesson) {
        console.log("creating a new countdown for", lesson.subjects.join(", "))
        let msg = makeTime(lesson.timeStampEnd)
        const embed = new Embed({
            title: lesson.subjects.join(", "),
            description: `${lesson.rooms.join(", ")} - ${lesson.teachers.join(", ")}`,
            fields: [
                { name: "Timer", value: msg }
            ]
        })
        let message
        try {
            message = await channel.send({ embeds: [embed] })
        } catch (e) {
            console.error(e)
        }
        return new CountDown(embed, lesson, message)
    }

    async check() {
        if (Date.now() > this.lesson.timeStampEnd) {
            await this.message.delete()
            return false
        }
        const msg = makeTime(this.lesson.timeStampEnd)
        if (this.embed.fields[0].value !== msg) {
            this.embed.fields[0].value = msg
            await this.message.edit({ embeds: [this.embed] })
        }
        return true
    }
}

/**
 * 
 * @param {Date} time 
 * @returns 
 */
function makeTime(time) {
    const diff = time - Date.now()
    const parts = []
    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = diff / (1000 * 60) % 60
    if (h > 0) {
        parts.push(`${h} Stunde${h > 1 ? "n" : ""}`)
    }

    parts.push(`${Math.ceil(m)} Minute${Math.ceil(m) === 1 ? "n" : ""}`)

    if (h <= 0 && m > 0 && m < 0.5) {
        return `fast geschaff!`
    }
    return `noch ${parts.join(" und ")}`
}