import React, {Component} from 'react'

class Markdown extends Component {
    render() {
        const text = this.props.text
        return (<div className="markdown">{text}</div>)
    }
}

export default Markdown