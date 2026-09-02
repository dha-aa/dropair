import os from "os";

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