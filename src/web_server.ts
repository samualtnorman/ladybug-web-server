import { ipcMain } from "electron"
import { Server as HTTPServer } from "http"
import { Server as WSServer } from "ws"
import { resolve } from "path"
import { readFile } from "./lib/fs"
import { lookup } from "mime-types"
import { parse } from "url"

let clients: { [key: string]: string[] } = {}

ipcMain.on("tick", (event, msg) => {
	let o: string[] = []

	for (let [ client, requests ] of Object.entries(clients))
		requests.length && o.push(`${client} ${requests.shift()}`)
	
	event.reply("tick", o)
})

logTimeLoop()

const httpServer = new HTTPServer((req, res) => {
	let dir = parse(req.url?.replace(/\.\./g, "") || "/").pathname || "/"

	if (dir.slice(-1) == "/")
		dir += "index.html"
	
	if (dir[0] == "/")
		dir = dir.slice(1)
	
	readFile(resolve("root", dir)).then(value => {
		res.writeHead(200, { "Content-Type": lookup(dir) || "text/plain" })
		res.end(value)
	}, (reason: NodeJS.ErrnoException | null) => {
		if (reason) {
			switch (reason.errno) {
				case -2:
				case -21:
					console.error(`404: ${dir}`)
					res.writeHead(404, { "Content-Type": "text/plain" })
					res.end("404 not found")
					break;
				default:
					console.error("500: unhandled error:", reason)
					res.writeHead(500, { "Content-Type": "text/plain" })
					res.end("500 internal server error")
			}
		}
	})
})

const wsServer = new WSServer({ noServer: true })

httpServer.on("upgrade", (request, socket, head) =>
	wsServer.handleUpgrade(
		request, socket, head,
		ws => wsServer.emit("connection", ws, request)
	)
)

wsServer.on("connection", (ws: WSServer) => {
	let client = Math.random().toString(36).substring(2)

	clients[client] = []

	return ws.on("message", (msg: string) => {
		clients[client].push(...JSON.parse(msg))
	})
})

httpServer.listen(8080)

function logTimeLoop() {
	console.log("time:", new Date)
	setTimeout(logTimeLoop, 600000)
}
