import React, {Component} from 'react'
import {Card} from "react-materialize";

class Info extends Component {
    render() {
        const message = this.props.message
        return (
            <span>
                <i className="fa fa-info-circle" aria-hidden="true"/>&nbsp;&nbsp;
                <span dangerouslySetInnerHTML={{__html: message}}/>
            </span>
        )
    }
}

class Warn extends Component {
    render() {
        const message = this.props.message
        return (
            <span>
                <i className="fa fa-exclamation-triangle" aria-hidden="true"/>&nbsp;&nbsp;
                {message}
            </span>
        )
    }
}

class Notification extends Component {
    render() {
        const data = this.props.data
        switch (data.type) {
            case "info":
                return (
                    <Card className="yellow lighten-2 notification" key={data.message}>
                        <p className="center-align">
                            <Info message={data.message}/>
                        </p>
                    </Card>
                );
            case "warn":
                return (
                    <Card className="red lighten-1 notification white-text" key={data.message}>
                        <p className="center-align">
                            <Warn message={data.message}/>
                        </p>
                    </Card>
                );
            default:
                return (
                    <Card>
                        <p>{data.message}</p>
                    </Card>
                )
        }
    }
}

export {Notification, Warn, Info}