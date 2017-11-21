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
		this.selectedIndexArr = []
		this.shiftMoveIndexArr = []
		this.lastSelected = -1
		this.lastHover = -1
		this.shift = false
		this.ctrl = false
	}

	componentDidMount() {
		ipcRenderer.send('getTestList')
		ipcRenderer.on('returnList', (e, list) => {
			this.list = []
			this.list = list
			this.forceUpdate()
		})

		//bind keydown event
		document.addEventListener('keydown', this.keydown.bind(this))
		document.addEventListener('keyup', this.keyup.bind(this))
	}
	
	// log render time
	componentWillUpdate() {
		console.time('update')
	}

	componentDidUpdate() {
		console.timeEnd('update')
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
	
	// set selected state for a row
	selectOne(index) {
		this.selectedIndexArr.push(index)
		this.lastSelected = index
		this.refs[index].select(true)	
	}
	
	rowSelect(isSelected,index) {
		if (isSelected) {
			//selected
			if (this.ctrl) {
				//ctrl is down (remove old lastSelected row state)
				let oldLastSelectedIndex = this.lastSelected
				this.selectOne(index)
				if (oldLastSelectedIndex != -1) {
					this.refs[oldLastSelectedIndex].forceUpdate()
				}
			}
			else if (this.shift) {
				//shift is down (select list between selected and lastSelected)
				if (this.lastSelected == -1) {
					this.selectOne(index)
				}else {
					this.shift = false
					let min = this.lastSelected<index?this.lastSelected:index
					let max = this.lastSelected<index?index:this.lastSelected
					console.log(min + ' '  + max)
					for(let i = min; i <= max; i++) {
						this.refs[i].shiftHover = false
						this.selectOne(i)
					}
					this.lastSelected = index
				}
			}
			else {
				//no keyDown event (cancel state of others selected row)
				this.selectedIndexArr.forEach(item => {
					this.refs[item].select(false)
				})
				this.selectedIndexArr = []
				this.selectOne(index)
			}
		}else {
			// cancel selected
			if (this.ctrl) {
				let itemIndex = this.selectedIndexArr.findIndex(item => item == index)
				if (itemIndex != -1) {
					let oldLastSelectedIndex = this.lastSelected
					this.selectedIndexArr.splice(itemIndex,1)
					this.refs[index].select(false)
					this.lastSelected = -1
					if (this.oldLastSelectedIndex != -1) this.refs[oldLastSelectedIndex].forceUpdate()
				}else {
					console.log('something wrong')
				}
			}else if (this.shift) {
				if (this.selectedIndexArr.length == 1) {
					this.lastSelected = -1
					this.refs[this.selectedIndexArr[0]].shiftHover = false
					this.refs[this.selectedIndexArr[0]].select(false)
					this.shiftMoveIndexArr = []
					this.selectedIndexArr = []
				}else {
					// there is a bug / todo
					this.shift = false
					let min = this.lastSelected<index?this.lastSelected:index
					let max = this.lastSelected<index?index:this.lastSelected
					console.log(min + ' '  + max)
					for(let i = min; i <= max; i++) {
						this.refs[i].shiftHover = false
						this.selectOne(i)
					}
					this.lastSelected = index
				}
			}else {
				// clear selectedArr && select lastone
				this.selectedIndexArr.forEach(item => {
					this.refs[item].isSelected = false
					this.refs[item].forceUpdate()
				})
				this.selectedIndexArr = []
				this.selectOne(index)
			}
		}
		console.log(this.selectedIndexArr)
		console.log(this.lastSelected)
	}

	keydown(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.ctrl = event.ctrlKey
		this.shift = event.shiftKey
		if (this.ctrl) {
			// update one row
			if (this.lastSelected == -1) return
			this.refs[this.lastSelected].forceUpdate()
		}

		if (this.shift) {
			// update row between last selected row and last hover row
			if (this.lastHover == -1) return
			this.mouseEnter(this.lastHover)
		}
	}

	keyup(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.ctrl = event.ctrlKey
		this.shift = event.shiftKey
		if (!this.ctrl) {
			// remove state from last selected row
			if (this.lastSelected == -1) return
			this.refs[this.lastSelected].forceUpdate()
		}
		if (!this.shift) {
			this.shiftMoveIndexArr.forEach(item => {
				this.refs[item].hover(false)
			})
			this.shiftMoveIndexArr = []
		}
	}

	mouseEnter(index) {
		this.lastHover = index
		if (!this.shift || this.lastSelected == -1) return
		let min = this.lastSelected<index?this.lastSelected:index
		let max = this.lastSelected<index?index:this.lastSelected
		//remove style
		let newShiftArr = []
		this.shiftMoveIndexArr.forEach(item => {
			if (item > max || item < min) {
				this.refs[item].hover(false)
			}else {
				newShiftArr.push(item)
			}
		})
		this.shiftMoveIndexArr = newShiftArr
		//add style
		for(let i = min; i<=max; i++) {
			if (this.refs[i].shiftHover) {
				
			}else {
				this.shiftMoveIndexArr.push(i)
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