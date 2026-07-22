export async function onRequestGet() {
    const statusUrl = "https://status.wolflink115.com";

    const icons = {
        "Homepage": "🏠",
        "Immich": "📸",
        "Jellyfin": "🎬",
        "Home Assistant": "🏡",
        "SearXNG": "🔍",
        "Syncthing": "📂",
        "Portainer": "🐳",
        "Vaultwarden": "🛡",
        "Invidious": "🎥",
    };

    try {
        const [statusRes, heartbeatRes] = await Promise.all([
            fetch(`${statusUrl}/api/status-page/status`),
            fetch(`${statusUrl}/api/status-page/heartbeat/status`)
        ]);

        const status = await statusRes.json();
        const heartbeat = await heartbeatRes.json();

        const services = status.publicGroupList
            .flatMap(group => group.monitorList)
            .map(service => {
                const latest =
                    heartbeat.heartbeatList[service.id]?.slice(-1)[0];

                return {
                    name: service.name,
                    emoji: icons[service.name] ?? "🖥️",
                    online: latest?.status === 1,
                    ping: latest?.ping ?? null,
                    checked: latest?.time ?? null,
                };
            })
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

            services.sort(
                (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)
            );

        const online = services.filter(s => s.online).length;

        return Response.json({
            online,
            total: services.length,
            services,
        });
    } catch (err) {
        return Response.json({
            error: true,
            message: err.message,
        });
    }
}
