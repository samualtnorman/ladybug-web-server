import './index.css';

import { ipcRenderer } from "electron"

let tickSpeed = 500

tickLoop()

ipcRenderer.on("tick", (event, msg) => {
	console.log(msg)
})

function tickLoop() {
	ipcRenderer.send("tick", "tick")

	setTimeout(tickLoop, tickSpeed)
}
