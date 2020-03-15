import { readFile as readFile_, PathLike } from "fs"

export function readFile(path: PathLike) {
	return new Promise<Buffer>((resolve, reject) =>
		readFile_(path, (err, data) => err ? reject(err) : resolve(data))
	)
}
