import React, {Component} from 'react'

import {FEEDBACK_FORM_URL, JSON_URL, P2P_MANUAL_URL} from "../constants"
import {refactorData, refactorLinks} from "../methods"

import ProfileInfo from "./ProfileInfo";
import Markdown from "./Markdown";
import Week from "./Week";
import {Info, Notification} from "./Notifications";
import {Button, Col, Collapsible, Modal, CollapsibleItem, Input, Row} from "react-materialize";
import EvaluateModal from "./EvaluateModal";
import axios from 'axios'

class Dashboard extends Component {
    constructor() {
        super()
        this.state = {
            status: 1
        }
        this.changeDate = this.changeDate.bind(this)
        this.updateData = this.updateData.bind(this)
        this.sendFeedback = this.sendFeedback.bind(this)
    }

    sendFeedback(){
        axios({
            method: 'post',
            url: 'meeting-feedback',
            data: {
                status: this.state.status,
                mark: this.state.mark,
                message: this.state.feedback_message,
                week: this.state.user.current_week,
                'meeting-number': this.state._feedback_form._meetup
            }
        })
    }

    updateData(callback){
        axios.get(JSON_URL + "?ajax=true")
            .then(res => {
                this.setState(refactorData(res.data.data), () => {
                    if(typeof callback === "function")
                        callback()
                    if(this.state._feedback_form._visible)
                        document.getElementById('feedback_modal_trigger').click();
                })
            })
    }

    componentDidMount() {
        this.updateData(refactorLinks)
    }

    changeDate(e){
            let data = this.state
            data.now.today = e.target.value
            this.setState(refactorData(data))
    }

    render() {
        if (this.state.user){
            const data  = this.state
            return (
                <Row>
                    <Button onClick={this.updateData} className="hidden" id="refresh-button">refresh</Button>
                    {/*<div id="my_date">*/}
                        {/*<input type="date" value={data.now.today} onChange={this.changeDate}/>*/}
                    {/*</div>*/}
                    {data.now.notifications && data.now.notifications.map((notification, i) =>
                        <div key={'notification' + i}>
                            <Notification data={notification}/>
                        </div>
                    )}

                    <Row>
                        <div className="col l3 m12 s12">
                            <ProfileInfo user={data.user}/>
                        </div>

                        <div className="col l9 m12 s12">
                            <h3>Сейчас неделя <span>{data.user.current_week}</span>, план такой:</h3>
                            <div className="col l12 white card">
                                <Markdown text={data.now.week_plan.replace(/\n/g, "\r\n")}/>
                                <br/>
                                <div>не хватает понимания процесса? читай&nbsp;
                                    <a href={P2P_MANUAL_URL} target="_blank" rel="noopener noreferrer">manual
                                        по peer-to-peer обучению</a> или посмотри&nbsp;
                                    <Modal
                                        trigger={<a href="#">визуальную схему</a>}>
                                        <img src="http://send2rshmelev.shpp.me/downloads/f/p2pscs_1F4AABAB.png" style={{width: '100%'}} alt="Visual scheme p2p"/>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </Row>

                    <Row>
                        <h3>Недели</h3>
                        <Collapsible defaultActiveKey={data.user.current_week-1}>
                            {data.weeks.map((week, i) => {
                                 return week._started ?
                                    <CollapsibleItem header={
                                        <div>
                                            <div><strong>
                                                Неделя #{week.info.number}
                                                {week._finished ? ` -- средняя оценка: ${week._avg_review_marks[1] || week._avg_review_marks[0]} ${week._avg_review_marks[1] ? '(было ' + week._avg_review_marks[0] + ')' : '' }` : ''}
                                                {week._warnings ?
                                                    <span
                                                        className="red-text float-right">получено предупреждений: {week._warnings} </span>
                                                    : ''}
                                            </strong></div>
                                        </div>
                                    } key={week.id} icon="expand_more">
                                        <Week data={week} week_index={i} lectures={data.lectures[i]} now={data.now}
                                              users={data.users} header_templates={data.headers_templates}
                                              videos={data.videos.weeks[i]} className="white"
                                              me={data.user}
                                        />
                                    </CollapsibleItem>
                                     : ''
                                }
                            )}
                        </Collapsible>
                    </Row>

                    <Modal
                        id="sendFeedback"
                        trigger={<Button className="hidden" id="feedback_modal_trigger"/>}
                        actions={[
                            <Input type="radio" name="status" value="4"  className="with-gap float-left"
                                   onChange={e => {this.setState({status: e.target.value}) }}
                                   checked={parseInt(this.state.status) === 4}
                                   label={
                                       <a href={FEEDBACK_FORM_URL} target="_blank"
                                          rel="noopener noreferrer"
                                          id="google-form-feedback">оставить анонимный
                                           &nbsp;отзыв</a>
                                   }
                            />,
                            <Button id="meeting-feedback-submit" modal="close"
                                    className="btn-flat float-right"
                                    onClick={this.sendFeedback}>ok
                            </Button>
                        ]}
                        modalOptions={{dismissible: false}}
                    >
                        <Col className="modal-content">
                            <h4>Привет! Оставьте, пожалуйста, отзыв о прошедшей встрече :)</h4>
                            <div>(она была в {data._feedback_form._week_day === 1 ? 'понедельник' : 'среду'}, {data._feedback_form._date})</div>
                            <Row className="paddinged">
                                <Col l={12} m={12} s={12}>
                                    <Input type="radio" onChange={e => {this.setState({status: e.target.value}) }} checked={parseInt(this.state.status) === 1} name="status" value="1"
                                           className="with-gap" label="я не пришел"/>
                                </Col>
                                <Col l={12} m={12} s={12}>
                                    <Input type="radio" onChange={e => { this.setState({status: e.target.value}) }} checked={parseInt(this.state.status) === 2} name="status" value="2"
                                           className="with-gap"
                                           label="я спешу, пустите меня побыстрее на портал, пожалуйста"/>
                                </Col>
                                <Col l={12} m={12} s={12}>
                                    <Input type="radio" onChange={e => { this.setState({status: e.target.value}) }} checked={parseInt(this.state.status) === 3} name="status" value="3"
                                           className="with-gap" label="да, конечно"/>
                                </Col>
                            </Row>
                            {parseInt(this.state.status) === 3 ?
                                <Col className="row paddinged" id="evaluate-meeting">
                                    <Col className="col l10 offset-l1">
                                        <Col l={1} m={1} s={1}>бесполезно</Col>
                                        <Col l={1} m={1} s={1}>
                                            <Input type="radio" checked={parseInt(this.state.mark) === 1}
                                                   onChange={e => {this.setState({mark: e.target.value}) }} name="mark" value="1"
                                                   className="with-gap"
                                                   label={<span className="radio-point-label">1</span>}/>
                                        </Col>
                                        <Col l={1} m={1} s={1}>
                                            <Input type="radio" checked={parseInt(this.state.mark) === 2}
                                                   onChange={e => {this.setState({mark: e.target.value}) }} name="mark" value="2"
                                                   className="with-gap"
                                                   label={<span className="radio-point-label">2</span>}/>
                                        </Col>
                                        <Col l={1} m={1} s={1}>
                                            <Input type="radio" checked={parseInt(this.state.mark) === 3}
                                                   onChange={e => {this.setState({mark: e.target.value}) }} name="mark" value="3"
                                                   className="with-gap"
                                                   label={<span className="radio-point-label">3</span>}/>
                                        </Col>
                                        <Col l={1} m={1} s={1}>
                                            <Input type="radio" checked={parseInt(this.state.mark) === 4}
                                                   onChange={e => {this.setState({mark: e.target.value}) }} name="mark" value="4"
                                                   className="with-gap"
                                                   label={<span className="radio-point-label">4</span>}/>
                                        </Col>
                                        <Col l={1} m={1} s={1}>
                                            <Input type="radio" checked={parseInt(this.state.mark) === 5}
                                                   onChange={e => {this.setState({mark: e.target.value}) }} name="mark" value="5"
                                                   className="with-gap"
                                                   label={<span className="radio-point-label">5</span>}/>
                                        </Col>
                                        <Col l={1} m={1} s={1}>круто</Col>
                                        <Col l={12} m={12} s={12} className="input-field col s12">
                                        <textarea id="meeting-feedback" className="materialize-textarea" name="message"
                                          placeholder="оценка без содержательного комментария &mdash; достаточно бесполезная штука"
                                                  onChange={e => {this.setState({ feedback_message: e.target.value})}}
                                        />
                                        </Col>
                                        <Col l={12} m={12} s={12}><Info
                                            message="этот отзыв не будет доступен никому кроме администрации школы"/>
                                        </Col>
                                    </Col>
                                </Col>
                                :''
                            }
                        </Col>
                    </Modal>
                </Row>
            )
        }
        else
            return (
                <h1>Loading...</h1>
            )

    }
}

export default Dashboard
