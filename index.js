const { Client } = require("discord-rpc");
const fs = require("fs");
const path = require("path");
const { argv } = require("node:process");

process.on("SIGINT", function() {
    console.log("\nGracefully shutting down from SIGNINT (CTRL-C)");

    process.exit(1);
});

const presence = argv[2];

if(!presence) {
    return console.log("Pls specify the presence name")
}

let presenceData;
if(presence) {
    const presencePath = path.resolve(`presences/${presence}.json`);
    if(!fs.existsSync(presencePath)) {
        console.error("path does not exist");
        return;
    }
    presenceData = JSON.parse(fs.readFileSync(presencePath).toString());
}

let client = new Client({transport: 'ipc' });
async function setActivity() {
    if(!client || !presenceData) {
        return;
    }

    let startTimestamp = new Date();

    client.setActivity({
        state: presenceData.presence.state,
        startTimestamp: startTimestamp,
        details: presenceData.presence.details,
        largeImageKey: presenceData.presence.largeImageKey,
        largeImageText: presenceData.presence.largeImageText,
        smallImageKey: presenceData.presence.smallImageKey,
        smallImageText: presenceData.presence.smallImageText,
        ...presenceData.party,
        instance: false,
    });
}

client.on("ready", () => {
    setActivity();

    setInterval(() => {
        setActivity()
    }, 15e3)
});

if(presenceData && presenceData.clientId) {
    client.login({ clientId: presenceData.clientId }).then(x => {
        console.log("Logged In")
    }).catch(err => {
        console.error(err);
    });
}
