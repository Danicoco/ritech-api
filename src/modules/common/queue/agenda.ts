/** @format */

import { Agenda } from "@hokify/agenda"
import { configs } from "../utils/config"
import { renewSubscription } from "../jobs/subscription"

const agenda = new Agenda({
    name: "Ritech",
    defaultConcurrency: 5,
    db: { address: configs.MONGO_DB_URL, collection: "jobs" },
})

agenda
    .on("ready", () => console.log("Agenda started!"))
    .on("error", err => console.log("Agenda connection error!", err?.message))

const definitions = [renewSubscription]

definitions.forEach(definition => definition(agenda));

(async () => {
    await agenda.start()
})()

export default agenda
