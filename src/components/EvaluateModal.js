import React, {Component} from 'react'
import {Button, Col, Input, Modal, ProgressBar} from "react-materialize";
import {P2P_MANUAL_URL} from "../constants";
import axios from 'axios'

class EvaluateModal extends Component {

    constructor() {
        super();
        this.state = {
            message: ''
        }
        this.sendMark = this.sendMark.bind(this);
    }

    sendMark() {
        const mark = parseInt(document.querySelectorAll('input[name="mark"]:checked')[0].value)
        if (!this.state.message || this.state.message.replace(/\s/g, "").length < 50/this.props.divider) {
            alert('Маловат комментарий: минимум ' + 50/this.props.divider + ' символов. вы ввели: ' + (this.state.message ? this.state.message.replace(/\s/g, "").length : '0'));
            return
        }
        if(!mark){
            alert('Укажите, пожалуйста, оценку.')
            return
        }
        axios.post(this.props.action, {
            _token: document.querySelector('meta[name=csrf-token]').content,
            author: this.props.author_id,
            receiver: this.props.receiver,
            mark: mark,
            message: this.state.message,
            mark_type: this.props.mark_type,
            week: this.props.week,
            task: this.props.task_number
        })
            .then(res => {
                console.log(res)
                document.getElementById('refresh-button').click()
                document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.click());
            })
    }


    render() {
        return (
            <Modal header={this.props.header}
                   actions={[<Button onClick={this.sendMark}>отправить</Button>,
                       <Button modal="close" className="close-button">х</Button>
                   ]}
                   trigger={this.props.trigger}
            >
                <Col l={12} s={12} m={12} className="paddinged">
                    <Col l={10} className="offset-l1 row">
                        <Col l={2} m={2} s={4}>Оценка: </Col>
                        <Col l={1} m={1} s={1}>
                            <Input type="radio" name="mark" value="1"
                                   className="with-gap"
                                   label={<span className="radio-point-label">1</span>}/>
                        </Col>
                        <Col l={1} m={1} s={1}>
                            <Input type="radio" name="mark" value="2"
                                   className="with-gap"
                                   label={<span className="radio-point-label">2</span>}/>
                        </Col>
                        <Col l={1} m={1} s={1}>
                            <Input type="radio" name="mark" value="3"
                                   className="with-gap"
                                   label={<span className="radio-point-label">3</span>}/>
                        </Col>
                        <Col l={1} m={1} s={1}>
                            <Input type="radio" name="mark" value="4"
                                   className="with-gap"
                                   label={<span className="radio-point-label">4</span>}/>
                        </Col>
                        <Col l={1} m={1} s={1}>
                            <Input type="radio" name="mark" value="5"
                                   className="with-gap"
                                   label={<span className="radio-point-label">5</span>}/>
                        </Col>
                        <Col l={3} m={3} s={12}><a href={P2P_MANUAL_URL + '#bookmark=id.81eprsz449vc'} target="_blank"
                                                  rel="noopener noreferrer">как оценивать?</a></Col>
                    </Col>
                    <Col l={10} s={12} className="offset-l1 row">
                        <Col l={2} m={2} s={12}>
                            Комментарий:
                        </Col>
                        <Col l={10} m={10} s={12}>
                            <textarea onChange={e => this.setState({message: e.target.value})}
                                      className="col l12 m12 s12 materialize-textarea"/>
                        </Col>
                        <ProgressBar progress={this.state.message.replace(/\s/g, "").length/(50/this.props.divider)*100}/>
                    </Col>
                </Col>
            </Modal>
        )
    }
}

export default EvaluateModal