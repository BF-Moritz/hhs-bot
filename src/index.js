import { Client, Intents } from "discord.js"
import { config } from "dotenv"
import { CountDown } from "./countdown.js"
import { updateLessons } from "./lessons.js";
import { sleep } from "./sleep.js";

config()

const guildID = process.env.GUILD_ID
const channelID = process.env.CHANNEL_ID

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
    let lessons = await updateLessons()
    const guild = client.guilds.cache.get(guildID)
    const channel = guild.channels.cache.get(channelID)
    let date = new Date(Date.now()).toLocaleDateString("de");
    let message = await channel.send({ embeds: [], content: `Stunden am ${date}` })
    let countDown = new CountDown(message, lessons, date)

    while (true) {
        const currentDate = new Date(Date.now()).toLocaleDateString("de");
        if (currentDate !== date) {
            lessons = await updateLessons()
            try {
                await message.delete()
            } catch (e) {
                console.error(e)
            }
            date = currentDate;
            message = await channel.send({ embeds: [], content: `Stunden am ${date}` })
            countDown = new CountDown(message, lessons, date)
        }

        countDown.update()
        await sleep(1000 * 5)
    }
});

client.login(process.env.TOKEN);