import { ipcRenderer } from 'electron'

import React, { Component, createClass } from 'react'
import ReactDom from 'react-dom'
import { Divider  } from 'material-ui'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import css from './assets/index'
import Row from './components/Row'

class App extends Component {
	constructor(props) {
		super()
		this.list = []
		this.selectedIndex = []
		this.shiftMoveIndex = []
		this.lastSelected = -1
		this.shift = false
		this.ctrl = false
	}

	componentDidMount() {
		ipcRenderer.send('getTestList')
		ipcRenderer.on('returnList', (e, list) => {
			console.log('receive list...')
			console.log((new Date()).getTime())
			this.list = []
			this.list = list
			this.forceUpdate()
		})
		//bind keydown event
		document.addEventListener('keydown', this.keypress.bind(this))
		document.addEventListener('keyup', this.keypress.bind(this))
	}

	render() {
		let _this = this
		return (
			<div id='list-container'>
				<div className='row-title'>
					<div>文件名称</div>
					<div>时间</div>
					<div>大小</div>
				</div>
				<Divider style={{marginLeft: '120px',marginTop:'0px'}}/>
				<div id='rowlist-content'>
				{this.list.map((item,index) => {
					return React.createElement(Row, {
						infor:item,
						key:item.uuid,
						ref:index,
						index:index,
						rowSelect:this.rowSelect.bind(_this),
						mouseEnter:this.mouseEnter.bind(_this),
						parent:_this
					})
				})}
				</div>
			</div>
			)
	}

	componentWillUpdate() {
		console.log('will update')
		console.log((new Date()).getTime())
	}

	componentDidUpdate() {
		console.log('did update')
		console.log((new Date()).getTime())
	}

	selectOne(index) {
		this.selectedIndex.push(index)
		this.lastSelected = index
		this.refs[index].select(true)	
	}

	rowSelect(isSelected,index) {
		if (isSelected) {
			//selected
			if (this.ctrl) {
				//ctrl is down
				this.selectOne(index)
			}
			else if (this.shift) {
				//shift is down
				if (this.lastSelected == -1) {
					this.selectOne(index)
				}else {
					let min = this.lastSelected<index?this.lastSelected:index
					let max = this.lastSelected<index?index:this.lastSelected
					console.log(this.lastSelected)
					console.log(min + ' '  + max)
					for(let i = min; i <= max; i++) {
						let itemIndex = this.selectedIndex.findIndex(item => item == i)
						if (itemIndex == -1) {
							this.selectOne(i)
						}
					}
					this.lastSelected = index
				}
			}
			else {
				//no keyDown event
				this.selectedIndex.forEach(item => {
					this.refs[item].select(false)
				})
				this.selectedIndex = []
				this.selectOne(index)
			}
		}else {
			// cancel selected
			let itemIndex = this.selectedIndex.findIndex(item => item == index)
			if (itemIndex != -1) {
				this.selectedIndex.splice(itemIndex,1)
				this.refs[index].select(false)
			}else {
			}
		}
	}

	keypress(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.ctrl = event.ctrlKey
		this.shift = event.shiftKey

		if (!this.shift) {
			this.shiftMoveIndex.forEach(item => {
				this.refs[item].hover(false)
			})
			this.shiftMoveIndex = []
		}
	}

	mouseEnter(index) {
		if (!this.shift) return
		let min = this.lastSelected<index?this.lastSelected:index
		let max = this.lastSelected<index?index:this.lastSelected
		//remove style
		let newShiftArr = []
		this.shiftMoveIndex.forEach(item => {
			if (item > max || item < min) {
				this.refs[item].hover(false)
			}else {
				newShiftArr.push(item)
			}
		})
		this.shiftMoveIndex = newShiftArr
		//add style
		for(let i = min; i<=max; i++) {
			if (this.refs[i].shiftHover) {
				
			}else {
				this.shiftMoveIndex.push(i)
				this.refs[i].hover(true)
			}
		}
	}
} 

const render = () => ReactDom.render(
	<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
		<App/>
	</MuiThemeProvider>
	, document.getElementById('app'))

render()

if (module.hot) {
	module.hot.accept()
}