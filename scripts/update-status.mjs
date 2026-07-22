import fs from "fs/promises";
import fetch from "node-fetch";

const STATUS_URL = "https://status.wolflink115.com";

const ICONS = {
    "Homepage": "🏠",
    "Immich": "📸",
    "Jellyfin": "🎬",
    "Home Assistant": "🏡",
    "SearXNG": "🔍",
    "Syncthing": "📂",
    "Portainer": "🐳",
    "Vaultwarden": "🛡️",
    "Invidious": "🎥",
};

const OUTPUT = "public/status.json";

async function loadPrevious() {
    try {
        const data = await fs.readFile(OUTPUT, "utf8");
        return JSON.parse(data);
    } catch {
        return null;
    }
}

try {

    console.log("Fetching status...");

    const [statusRes, heartbeatRes] = await Promise.all([
        fetch(`${STATUS_URL}/api/status-page/status`),
        fetch(`${STATUS_URL}/api/status-page/heartbeat/status`)
    ]);

    if (!statusRes.ok || !heartbeatRes.ok) {
        throw new Error("Status page returned an error.");
    }

    const status = await statusRes.json();
    const heartbeat = await heartbeatRes.json();

    const services = [];

    let online = 0;

    for (const group of status.publicGroupList) {

        for (const monitor of group.monitorList) {

            const latest =
                heartbeat.heartbeatList[monitor.id]?.at(-1);

            const isOnline = latest?.status === 1;

            if (isOnline) online++;

            services.push({
                id: monitor.id,
                name: monitor.name,
                emoji: ICONS[monitor.name] ?? "🖥️",
                online: isOnline,
                ping: latest?.ping ?? null,
                checked: latest?.time ?? null
            });

        }

    }

const ORDER = [
    "Homepage",
    "Immich",
    "Jellyfin",
    "SearXNG",
    "Home Assistant",
    "Portainer",
    "Syncthing",
    "Vaultwarden",
    "Invidious",
];

services.sort((a, b) =>
    ORDER.indexOf(a.name) - ORDER.indexOf(b.name)
);

    const output = {
        generated: new Date().toISOString(),
        surfaceOnline: true,
        summary: {
            online,
            total: services.length
        },
        services
    };

    await fs.writeFile(
        OUTPUT,
        JSON.stringify(output, null, 2)
    );

    console.log("status.json updated.");

} catch (err) {

    console.error(err);

    const previous = await loadPrevious();

    if (previous) {

        previous.surfaceOnline = false;
        previous.lastFailure = new Date().toISOString();

        await fs.writeFile(
            OUTPUT,
            JSON.stringify(previous, null, 2)
        );

        console.log("Keeping previous status.json.");

    } else {

        throw err;

    }

}
