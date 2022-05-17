import { Embed } from '@discordjs/builders';

export class CountDown {
	/**
	 *
	 * @param {*} message
	 * @param {object[]} lessons
	 * @param {*} date
	 */
	constructor(message, lessons, date) {
		this.lessons = lessons;
		this.message = message;
		this.date = date;
	}

	async update() {
		const embeds = [];
		const index = this.lessons.findIndex((v) => {
			return v.timeStampStart <= Date.now() && v.timeStampEnd >= Date.now();
		});
		let nextIndex = index;
		if (index !== -1) {
			const currentLessons = this.lessons[index];
			for (const lesson of currentLessons.lessons) {
				let msg = makeTime(lesson.timeStampEnd);
				const embed = new Embed({
					title:
						lesson.group === null
							? lesson.subjects.join(', ')
							: `Gruppe ${lesson.group}: ${lesson.subjects.join(', ')}`,
					description: `${lesson.rooms.join(', ')} - ${lesson.teachers.join(', ')}`,
					fields: [
						{ name: 'Timer', value: msg },
						{ name: 'Vertretungstext', value: lesson.text || '-' }
					]
				});

				embeds.push(embed);
			}
			embeds.sort((a, b) => {
				if (a.title < b.title) {
					return -1;
				}
				if (a.title > b.title) {
					return 1;
				}
				return 0;
			});
			nextIndex = index + 1 < this.lessons.length ? index + 1 : -1;
		} else {
			nextIndex = this.lessons.findIndex((v) => {
				return v.timeStampStart > Date.now();
			});
		}

		if (nextIndex >= 0) {
			embeds.push(
				new Embed({
					title: `Nächste Stunde(n): ${this.lessons[nextIndex].lessons
						.map((v) => (v.group === null ? '' : `${v.group}: `) + v.subjects.join(', '))
						.join(', ')}`,
					description: `Start: ${this.lessons[nextIndex].timeStampStart.getHours()}:${this.lessons[
						nextIndex
					].timeStampStart.getMinutes()}`,
					fields: [
						{
							name: 'Räume',
							value: this.lessons[nextIndex].lessons.map((v) => v.rooms.join(', ')).join(', ')
						},
						{
							name: 'Lehrer',
							value: this.lessons[nextIndex].lessons.map((v) => v.teachers.join(', ')).join(', ')
						}
					]
				})
			);
		}

		let changes = this.message.embeds.length !== embeds.length;
		if (!changes) {
			for (let i = 0; i < embeds.length; i++) {
				if (embeds[i].title !== this.message.embeds[i].title) {
					changes = true;
					break;
				}

				if (embeds[i].description !== this.message.embeds[i].description) {
					changes = true;
					break;
				}

				if (embeds[i].fields[0].value !== this.message.embeds[i].fields[0].value) {
					changes = true;
					break;
				}

				if (embeds[i].fields[1].value !== this.message.embeds[i].fields[1].value) {
					changes = true;
					break;
				}
			}
		}

		if (changes) {
			await this.message.edit({
				embeds,
				content: `Stunden am ${this.date}`
			});
			await this.message.fetch();
		}
	}
}

/**
 *
 * @param {Date} time
 * @returns
 */
function makeTime(time) {
	const diff = time - Date.now();
	const parts = [];
	const h = Math.floor(diff / (1000 * 60 * 60));
	const m = (diff / (1000 * 60)) % 60;
	if (h > 0) {
		parts.push(`${h} Stunde${h > 1 ? 'n' : ''}`);
	}

	parts.push(`${Math.ceil(m)} Minute${Math.ceil(m) === 1 ? '' : 'n'}`);

	if (h <= 0 && m > 0 && m < 0.5) {
		return `fast geschaff!`;
	}
	return `noch ${parts.join(' und ')}`;
}
