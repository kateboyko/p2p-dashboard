import React, {Component} from 'react'
import {Input} from "react-materialize";
import axios from 'axios'

class CheckboxForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            disabled: false
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange() {
        this.setState({
            checked: !this.state.checked
        }, () => {
            let data = {
                _token: document.querySelector('meta[name=csrf-token]').content,
                week: this.props.week_number,
                confirmed: this.state.checked,
                online: this.state.checked,
                type: 'request'
            }
            axios({
                method: 'post',
                url: this.props.action,
                data: data
            }).then(res=>{
                if(res)
                    console.log(res);
                document.getElementById('refresh-button').click()
            })
        })


    }
    componentDidMount(){
        this.setState({
            checked: this.props.checked
        })
    }
    render() {
        return (
            <Input
                type="checkbox"
                checked={this.state.checked}
                disabled={this.props.disabled}
                name={this.props.name}
                id={this.props.name}
                onChange={this.handleInputChange}
                label={
                    <span>{this.props.text}</span>
                }
            />
        )
    }
}

export default CheckboxForm