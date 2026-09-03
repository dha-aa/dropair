import os from "os";

// Returns the first non-internal IPv4 address of the local machine.
// Falls back to localhost if no suitable network interface is found.
export function getLocalIP() {
    for (const networks of Object.values(os.networkInterfaces())) {
        for (const network of networks ?? []) {
            if (network.family === "IPv4" && !network.internal) {
                return network.address;
            }
        }
    }

    return "127.0.0.1";
}