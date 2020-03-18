import { app, BrowserWindow } from "electron"

declare const MAIN_WINDOW_WEBPACK_ENTRY: any

if (require("electron-squirrel-startup")) // eslint-disable-line global-require
	app.quit()

app.on("ready", createWindow)
app.on("window-all-closed", () => process.platform != "darwin" && app.quit())
app.on("activate", () => BrowserWindow.getAllWindows().length || createWindow())

import "./web_server"

function createWindow() {
	const mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			nodeIntegration: true
		},
		autoHideMenuBar: true

	})

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
	mainWindow.webContents.openDevTools()
}

