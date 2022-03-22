import { Embed } from "@discordjs/builders"
import { Message } from "discord.js";

export class CountDown {
    constructor(message, lessons, date) {
        this.lessons = lessons
        this.message = message
        this.date = date
    }

    async update() {
        const embeds = []
        const currentLessons = this.lessons.filter(v => v.timeStampStart <= Date.now() && v.timeStampEnd >= Date.now())
        for (const lesson of currentLessons) {
            let msg = makeTime(lesson.timeStampEnd)
            const embed = new Embed({
                title: `Gruppe ${lesson.group}: ${lesson.subjects.join(", ")}`,
                description: `${lesson.rooms.join(", ")} - ${lesson.teachers.join(", ")}`,
                fields: [
                    { name: "Timer", value: msg }
                ]
            })
            embeds.push(embed)
        }
        embeds.sort((a, b) => {
            if (a.title < b.title) { return -1; }
            if (a.title > b.title) { return 1; }
            return 0;
        })
        await this.message.edit({ embeds, content: `Stunden am ${this.date}` })
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