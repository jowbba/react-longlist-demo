import path from 'path'
import fs from'fs'

import { app, ipcMain, BrowserWindow } from 'electron'

import UUID from 'node-uuid'

let _mainWindow = null

app.on('ready', function() {

	_mainWindow = new BrowserWindow({
		frame: true,
		height: 768,
		resizable: true,
		width: 1366,
		minWidth: 1366,
		minHeight: 768,
		title:'test'
	})

	_mainWindow.on('page-title-updated',function(event){
		event.preventDefault()
	})
	_mainWindow.webContents.openDevTools()
	_mainWindow.loadURL('file://' + process.cwd() + '/build/index.html')

})

ipcMain.on('getTestList', e => {
	let arr = []
	console.log((new Date()).getTime())
	for (let i = 0; i < 100; i++) {
		arr.push({
			name:Math.random()*10000,
			date:(new Date()),
			size:Math.random()*1000,
			uuid:UUID.v4(),
			type:Math.random()<0.5?'folder':'file'
		})
	}
	console.log((new Date()).getTime())
	_mainWindow.webContents.send('returnList',arr)
})