import { Server as HTTPServer } from "http"
import { Server as WSServer } from "ws"
import { resolve } from "path"
import { readFile } from "./lib/fs"
import { lookup } from "mime-types"

const httpServer = new HTTPServer((req, res) => {
	let dir = req.url || "/"

	dir = `.${dir}`

	if (dir.slice(-1) == "/")
		dir += "index.html"
	
	dir = resolve("root", dir)

	readFile(dir).then(value => {
		res.writeHead(200, { "Content-Type": lookup(dir) || "text/plain" })
		res.end(value)
	}, reason => {
		console.error(`caught error: "${reason}"`)
		res.writeHead(404, { "Content-Type": "text/plain" })
		res.end("404 not found")
	})
})

const wsServer = new WSServer({ noServer: true })

httpServer.on(
	"upgrade",
	(request, socket, head) => wsServer.handleUpgrade(
		request, socket, head,
		ws => wsServer.emit("connection", ws, request)
	)
)

wsServer.on("connection", (ws: WSServer) => {
	ws.on("message", (msg: string) => {
		console.log(msg)
	})
})

httpServer.listen(80)
