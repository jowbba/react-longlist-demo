import path from 'path'
import fs from'fs'

import { app, ipcMain, BrowserWindow, Menu, Tray } from 'electron'

import UUID from 'node-uuid'

let _mainWindow = null
let tray = null

app.on('ready', function() {

	_mainWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth: 1280,
		minHeight: 720,
		title:'test'
	})

	_mainWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	_mainWindow.webContents.openDevTools()
	_mainWindow.loadURL('file://' + process.cwd() + '/build/index.html')
	tray = new Tray(path.join(__dirname,'180-180.png'))
	const contextMenu = Menu.buildFromTemplate([
	    {label: '显示', type: 'normal', click:() => {
	    	
	    }},
	    {label: '退出', type: 'normal', click:() => {
	    	app.quit()
	    }}
	])
  	tray.setToolTip('This is my application.')
  	tray.setContextMenu(contextMenu)
})

ipcMain.on('getTestList', e => {
	let arr = []
	for (let i = 0; i < 1000; i++) {
		arr.push({
			name:Math.random()*10000,
			date:(new Date()),
			size:Math.random()*1000,
			uuid:UUID.v4(),
			type:Math.random()<0.5?'folder':'file'
		})
	}
	_mainWindow.webContents.send('returnList',arr)
})