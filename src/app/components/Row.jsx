import React, { Component, createClass } from 'react'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'

	class Row extends Component {
		constructor(props) {
			super(props)
			this.show = true
			this.isSelected = false
			this.shiftHover = false

			this.select = (s) => {
				this.isSelected = s
				this.forceUpdate()
			}

			this.hover = (h) => {
				this.shiftHover = h
				this.forceUpdate()
			}
		}

		renderLeading() {
			let style = {width:'4px',height:'80%',backgroundColor:'#FFF',opacity:1,flex:'0 0 4px'}
			if (this.isSelected) {
				Object.assign(style,{backgroundColor:'rgba(0,0,0,.26)',height:'20px'})
			}
			return (<div style={style}></div>)
		}

		render() {
			let style = {}
			if (this.isSelected) {
				style = {backgroundColor:'#f5f5f5'}
			}
			if (this.shiftHover) {
				Object.assign(style,{color:'red'})
			}
			if (this.show) {
				return (
					<div className='row' style={style} onClick={this.rowClick.bind(this)} onMouseEnter={this.mouseEnter.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
						<div className='row-select'>
							{ this.renderLeading() }
							<div style={{flex: '0 0 12px'}} />
      
							<div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}} >
        				{
        					this.props.infor.type=='folder'?
        					<FileFolder style={{color: '#000', opacity: 0.54}} />:
        					<EditorInsertDriveFile style={{color: '#000', opacity: 0.54}} />
        				}
      				</div>
						</div>
						<div>{this.props.infor.name.toFixed(0)}</div>
						<div className='row-time'>{this.props.infor.date.slice(0,this.props.infor.date.indexOf('T'))}</div>
						<div className='row-size'>{this.props.infor.size.toFixed(0)} M</div>
					</div>
					)
			}
		}

		rowClick() {
			this.props.rowSelect(!this.isSelected,this.props.index)
			console.log(this.props.parent)
		}

		mouseEnter() {
			this.props.mouseEnter(this.props.index)
		}

		mouseLeave() {

		}
	}

export default Row