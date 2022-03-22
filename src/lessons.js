import WebUntis from "webuntis"


export async function updateLessons() {
    console.log("getting new lessons for", new Date(Date.now()).toLocaleDateString("de"))
    const untis = new WebUntis(process.env.UNTIS_SCHOOL, process.env.UNTIS_USERNAME, process.env.UNTIS_PASSWORD, process.env.UNTIS_URL)
    const lessons = []
    try {
        await untis.login()
        const timeTable = await untis.getOwnClassTimetableForToday()
        await untis.logout()
        for (const entry of timeTable) {
            if (!entry.code || entry.code !== "cancelled") {
                lessons.push({
                    date: entry.date,
                    start: entry.startTime,
                    end: entry.endTime,
                    timeStampStart: new Date(
                        Math.floor(entry.date / 10000),
                        ((Math.floor(entry.date / 100)) % 100) - 1,
                        entry.date % 100,
                        Math.floor(entry.startTime / 100),
                        entry.startTime % 100,
                        0
                    ),
                    timeStampEnd: new Date(
                        Math.floor(entry.date / 10000),
                        ((Math.floor(entry.date / 100)) % 100) - 1,
                        entry.date % 100,
                        Math.floor(entry.endTime / 100),
                        entry.endTime % 100,
                        0
                    ),
                    teachers: entry.te.map(v => v.longname),
                    rooms: entry.ro.map(v => v.longname),
                    subjects: entry.su.map(v => v.longname),
                    group: entry.lstext === "B" ? "B" : "A"
                })
            }
        }
        lessons.sort((a, b) => a.start - b.start)
    } catch (e) {
        console.log(e);
    }

    return lessons
}