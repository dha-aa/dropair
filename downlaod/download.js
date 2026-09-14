import fs from "fs/promises";
import getCwd from "../utils/cwd.js";

export default async function readDir() {
    const files = await fs.readdir(getCwd(), { withFileTypes: true });
    const data = [];
    for (const file of files) {
        if (!file.isDirectory() && !file.name.startsWith(".")) {
            const stats = await fs.stat(`${getCwd()}/${file.name}`);
            data.push({
                filename: file.name,
                size: stats.size,
                modified: stats.mtimeMs,
            });
        }
    }
    return data;
}
