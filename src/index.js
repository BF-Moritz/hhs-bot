import { Client, Intents } from "discord.js"
import { config } from "dotenv"
import { CountDown } from "./countdown.js"
import { updateLessons } from "./lessons.js";
import { sleep } from "./sleep.js";

config()

const guildID = "619268882623889443"
const channelID = "892457633603264532"

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
    let lessons = await updateLessons()
    const guild = client.guilds.cache.get(guildID)
    const channel = guild.channels.cache.get(channelID)
    let date = new Date(Date.now()).toLocaleDateString("de");

    while (true) {
        const currentDate = new Date(Date.now()).toLocaleDateString("de");
        if (currentDate !== date) {
            lessons = await updateLessons()
            date = currentDate;
        }

        const [lesson] = lessons.filter(v => v.timeStampStart < Date.now() && v.timeStampEnd > Date.now())
        if (lesson) {
            try {
                const countDown = await CountDown.makeCountDown(channel, lesson)
                do {
                    await sleep(1000)
                } while (await countDown.check())
            } catch (e) {
                console.error(e)
            }
        }
        await sleep(1000 * 10)
    }
});

client.login(process.env.TOKEN);