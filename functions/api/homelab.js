export async function onRequest() {
    const STATUS_URL = "https://status.wolflink115.com";

    try {
        const [statusRes, heartbeatRes] = await Promise.all([
            fetch(`${STATUS_URL}/api/status-page/status`),
            fetch(`${STATUS_URL}/api/status-page/heartbeat/status`)
        ]);

        const status = await statusRes.json();
        const heartbeat = await heartbeatRes.json();

        return Response.json({
            status,
            heartbeat
        });

    } catch (err) {

        return Response.json(
            {
                error: "Couldn't reach homelab."
            },
            {
                status: 503
            }
        );

    }
}
