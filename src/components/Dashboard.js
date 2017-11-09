import React, {Component} from 'react'

import {ADMIN_MAIL, FEEDBACK_FORM_URL, JSON_URL, P2P_MANUAL_URL} from "../constants"
import {refactorData, refactorLinks} from "../methods"

import ProfileInfo from "./ProfileInfo";
import Markdown from "./Markdown";
import Week from "./Week";
import {Info, Notification} from "./Notifications";
import {Button, Col, Collapsible, Modal, CollapsibleItem, Input, Row, Card} from "react-materialize";
import axios from 'axios'
import CheckboxForm from "./CheckboxForm";

class Dashboard extends Component {
    constructor() {
        super()
        this.state = {
            status: 1,
            editing: false,
        }
        this.changeDate = this.changeDate.bind(this)
        this.updateData = this.updateData.bind(this)
        this.updateReviewedAmount = this.updateReviewedAmount.bind(this)
        this.sendFeedback = this.sendFeedback.bind(this)
        this.saveAvailability = this.saveAvailability.bind(this)
        this.cancelParticipation = this.cancelParticipation.bind(this)
    }

    updateReviewedAmount() {
        axios({
            method: 'post',
            url: 'update-reviewed-amount',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                amount: this.state.max_students_to_review,
                review_number: this.state.volunteer._settings_compiled.review_number
            }
        }).then(() => {
            document.getElementById('refresh-button').click()
        })
    }

    saveAvailability() {
        axios({
            method: 'post',
            url: 'available-for-review',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                review_number: this.state.volunteer._settings_compiled.review_number,
                message: document.getElementById('availability').value
            }
        }).then(() => {
            document.getElementById('refresh-button').click()
        })
    }

    cancelParticipation() {
        axios({
            method: 'post',
            url: 'delete-user-from-review',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                bad_user_id: this.state.user.id,
            }
        }).then(() => {
            document.getElementById('refresh-button').click()
            setTimeout(refactorMarkdown, 500);
        })
    }

    sendFeedback() {
        if (parseInt(this.state.status) === 3) {
            if (!this.state.message || this.state.message.replace(/\s/g, "").length < 50) {
                alert('Маловат комментарий: минимум 50 символов. вы ввели: ' + (this.state.message ? this.state.message.replace(/\s/g, "").length : '0'))
                return
            }
            if (!this.state.mark) {
                alert('Укажите, пожалуйста, оценку.')
                return
            }
        }
        axios({
            method: 'post',
            url: 'meeting-feedback',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                status: this.state.status,
                mark: this.state.mark,
                message: this.state.feedback_message,
                week: this.state.user.current_week,
                'meeting-number': this.state._feedback_form._meetup
            }
        })
    }

    updateData(callback) {
        axios.get(JSON_URL + "?ajax=true")
            .then(res => {
                this.setState(refactorData(res.data.data), () => {
                    if (typeof callback === "function")
                        callback()
                    this.setState({
                        availability: this.state.availability ||
                        this.state.editing ? this.state.availability
                            : this.state.volunteer ? this.state.volunteer._settings_compiled.availability : this.state.availability,
                        max_students_to_review: this.state.max_students_to_review || (this.state.volunteer ? this.state.volunteer._settings_compiled.max_students_to_review : '')
                    })
                    // if(this.state._feedback_form._visible)
                    //     document.getElementById('feedback_modal_trigger').click();
                })
            })
    }

    componentDidMount() {
        this.updateData(refactorLinks)
    }

    changeDate(e) {
        let data = this.state
        data.now.today = e.target.value
        this.setState(refactorData(data))
    }

    render() {
        if (this.state.user) {
            const data = this.state,
                volunteer_data = data.volunteer
            return (
                <Row>
                    <Button onClick={this.updateData} className="hidden" id="refresh-button">refresh</Button>

                    {data.now.notifications && data.now.notifications.map((notification, i) =>
                        <div key={'notification' + i}>
                            <Notification data={notification}/>
                        </div>
                    )}

                    <Row>
                        <div className="col l3 m12 s12">
                            <ProfileInfo user={data.user} volunteer={data.volunteer}/>
                        </div>

                        <div className="col l9 m12 s12">
                            <h3>Сейчас неделя <span>{data.user.current_week}</span>, план такой:</h3>
                            <div className="col l12 white card">
                                <Markdown text={data.now.week_plan.replace(/\n/g, "\r\n")}/>
                                <br/>
                                {data.volunteer ?
                                    [
                                        <div key="123">Спасибо, что помогаете!</div>,
                                        <div key="1234"><a href={P2P_MANUAL_URL} target="_blank" rel="noopener noreferrer">manual
                                            по peer-to-peer обучению</a></div>
                                    ]
                                    :
                                    <div>не хватает понимания процесса? читай&nbsp;
                                        <a href={P2P_MANUAL_URL} target="_blank" rel="noopener noreferrer">manual
                                            по peer-to-peer обучению</a> или посмотри&nbsp;
                                        <Modal
                                            trigger={<a href="#">визуальную схему</a>}>
                                            <img src="http://send2rshmelev.shpp.me/downloads/f/p2pscs_1F4AABAB.png"
                                                 style={{width: '100%'}} alt="Visual scheme p2p"/>
                                        </Modal>
                                    </div>
                                }
                            </div>
                        </div>
                    </Row>

                    {data.volunteer ?
                        <Row>
                            <h3>Настройки волонтёра
                                {!volunteer_data._settings_compiled._editable ?
                                    <strong>(
                                        {
                                            volunteer_data._settings_compiled._is_review ?
                                                'Вы участвуете в ревью на этой неделе!'
                                                : "Ждите понедельника для регистрации на ревью"
                                        }
                                        )</strong> : ''
                                }
                            </h3>
                            <Card className="grey lighten-3">
                                <Row>
                                    <Col l={5} m={5} s={5}>Сколько человек вы готовы взять на себя в ближайшую
                                        неделю:&nbsp;
                                        {!volunteer_data._settings_compiled._editable ?
                                            volunteer_data._settings_compiled.max_students_to_review : ''
                                        }
                                    </Col>
                                    {volunteer_data._settings_compiled._editable ? [
                                            <Col l={1} m={1} s={1} key="dfdf">
                                                <input type="number" onChange={e => {
                                                    this.setState({max_students_to_review: e.target.value})
                                                }}
                                                       value={this.state.max_students_to_review}
                                                />
                                            </Col>,
                                            <Button waves="light" onClick={this.updateReviewedAmount} key="dfdfdf">Сохранить</Button>
                                        ]
                                        : ''
                                    }
                                    <Col l={12} m={12} s={12}>
                                        <div>На данный момент вы не завершили ревью для&nbsp;
                                            <strong>{data.volunteer._incomplete_reviews} человек.</strong></div>
                                    </Col>
                                </Row>
                                {!volunteer_data._settings_compiled._editable && volunteer_data.ongoing_review_registration?
                                    <Button waves="light" onClick={this.cancelParticipation}>отменить своё участие в
                                        ревью</Button>
                                    : ''
                                }
                                {parseInt(volunteer_data._settings_compiled.max_students_to_review) ?
                                    <Row>
                                        <Col l={6} m={6} s={6}>
                                            <CheckboxForm text="участвую в ревью (и первом и втором) на этой неделе"
                                                          name="confirm_review" action="confirm-part"
                                                          checked={volunteer_data._settings_compiled.review_confirmed}
                                                          disabled={!volunteer_data._settings_compiled._editable}/>
                                        </Col>
                                        <Col l={6} m={6} s={6}>
                                            <CheckboxForm text="вынужден участвовать удалённо"
                                                          name="review-place" action="review-place"
                                                          checked={volunteer_data._settings_compiled.online_request}
                                                          disabled={!volunteer_data._settings_compiled._editable}/>
                                            (<a target="_blank" href={P2P_MANUAL_URL + '#bookmark=id.jnlx1h9txek3'}>чем
                                            это плохо</a>)
                                        </Col>
                                        <div>
                                            {volunteer_data._settings_compiled.availability && !this.state.editing && !volunteer_data._settings_compiled.editable ? (
                                                <div>
                                                    <i className="fa fa-pencil-square-o" aria-hidden="true"
                                                       onClick={(e) => {
                                                           e.preventDefault();
                                                           this.setState({editing: true})
                                                       }}
                                                    />&nbsp;&nbsp;
                                                    <strong>Ваша доступность на ревью:</strong>&nbsp;
                                                    <i>{this.state.availability}</i>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Col l={9} m={9} s={9}>
                                                        <label htmlFor="availability">
                                                            Опишите, когда и как вы можете проводить ревью, а когда не
                                                            можете:
                                                            (<a href={P2P_MANUAL_URL + '#bookmark=id.a3fs6o9u10gx'}
                                                                target="_blank"
                                                                rel="noopener noreferrer">
                                                            что писать и зачем?</a>)
                                                        </label>
                                                        <textarea name="availability" id="availability"/>
                                                    </Col>
                                                    <Col l={3} m={3} s={3}>
                                                        <br/>
                                                        <Button waves='light' id="save_availability"
                                                                onClick={this.saveAvailability}>Сохранить</Button>
                                                    </Col>
                                                </div>
                                            )}
                                        </div>
                                    </Row> : ''
                                }
                            </Card>
                        </Row>
                        : ''
                    }
                    <Row>
                        <h3>Недели</h3>
                        <Collapsible defaultActiveKey={data.user.current_week - 1}>
                            {data.weeks.map((week, i) => {
                                    return week._started ?
                                        <CollapsibleItem header={
                                            <div>
                                                <div><strong>
                                                    Неделя #{week.info.number}
                                                    {!data.volunteer ?
                                                        <span>
                                                            {week._finished ?
                                                                ` -- средняя оценка: ${week._avg_review_marks[1] || week._avg_review_marks[0]} ${week._avg_review_marks[1] ? '(было ' + week._avg_review_marks[0] + ')' : '' }`
                                                                : ''}
                                                            {week._warnings ?
                                                                <span
                                                                    className="red-text float-right">получено предупреждений: {week._warnings} </span>
                                                                : ''}
                                                        </span>
                                                        : ''
                                                    }
                                                </strong></div>
                                            </div>
                                        } key={week.id} icon="expand_more">
                                            <Week data={week} week_index={i} lectures={data.lectures[i]} now={data.now}
                                                  users={data.users} header_templates={data.headers_templates}
                                                  videos={data.videos.weeks[i]} className="white"
                                                  volunteer={!!data.volunteer}
                                                  me={data.user}
                                            />
                                        </CollapsibleItem>
                                        : ''
                                }
                            )}
                        </Collapsible>
                    </Row>
                    {data._feedback_form ?
                        <Modal
                            id="sendFeedback"
                            trigger={<Button className="hidden" id="feedback_modal_trigger"/>}
                            actions={[
                                <Input type="radio" name="status" value="4" className="with-gap float-left"
                                       onChange={e => {
                                           this.setState({status: e.target.value})
                                       }}
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
                                <div>(она была
                                    в {data._feedback_form._week_day === 1 ? 'понедельник' : 'среду'}, {data._feedback_form._date})
                                </div>
                                <Row className="paddinged">
                                    <Col l={12} m={12} s={12}>
                                        <Input type="radio" onChange={e => {
                                            this.setState({status: e.target.value})
                                        }} checked={parseInt(this.state.status) === 1} name="status" value="1"
                                               className="with-gap" label="я не пришел"/>
                                    </Col>
                                    <Col l={12} m={12} s={12}>
                                        <Input type="radio" onChange={e => {
                                            this.setState({status: e.target.value})
                                        }} checked={parseInt(this.state.status) === 2} name="status" value="2"
                                               className="with-gap"
                                               label="я спешу, пустите меня побыстрее на портал, пожалуйста"/>
                                    </Col>
                                    <Col l={12} m={12} s={12}>
                                        <Input type="radio" onChange={e => {
                                            this.setState({status: e.target.value})
                                        }} checked={parseInt(this.state.status) === 3} name="status" value="3"
                                               className="with-gap" label="да, конечно"/>
                                    </Col>
                                </Row>
                                {parseInt(this.state.status) === 3 ?
                                    <Col className="row paddinged" id="evaluate-meeting">
                                        <Col className="col l10 offset-l1">
                                            <Col l={1} m={1} s={1}>бесполезно</Col>
                                            <Col l={1} m={1} s={1}>
                                                <Input type="radio" checked={parseInt(this.state.mark) === 1}
                                                       onChange={e => {
                                                           this.setState({mark: e.target.value})
                                                       }} name="mark" value="1"
                                                       className="with-gap"
                                                       label={<span className="radio-point-label">1</span>}/>
                                            </Col>
                                            <Col l={1} m={1} s={1}>
                                                <Input type="radio" checked={parseInt(this.state.mark) === 2}
                                                       onChange={e => {
                                                           this.setState({mark: e.target.value})
                                                       }} name="mark" value="2"
                                                       className="with-gap"
                                                       label={<span className="radio-point-label">2</span>}/>
                                            </Col>
                                            <Col l={1} m={1} s={1}>
                                                <Input type="radio" checked={parseInt(this.state.mark) === 3}
                                                       onChange={e => {
                                                           this.setState({mark: e.target.value})
                                                       }} name="mark" value="3"
                                                       className="with-gap"
                                                       label={<span className="radio-point-label">3</span>}/>
                                            </Col>
                                            <Col l={1} m={1} s={1}>
                                                <Input type="radio" checked={parseInt(this.state.mark) === 4}
                                                       onChange={e => {
                                                           this.setState({mark: e.target.value})
                                                       }} name="mark" value="4"
                                                       className="with-gap"
                                                       label={<span className="radio-point-label">4</span>}/>
                                            </Col>
                                            <Col l={1} m={1} s={1}>
                                                <Input type="radio" checked={parseInt(this.state.mark) === 5}
                                                       onChange={e => {
                                                           this.setState({mark: e.target.value})
                                                       }} name="mark" value="5"
                                                       className="with-gap"
                                                       label={<span className="radio-point-label">5</span>}/>
                                            </Col>
                                            <Col l={1} m={1} s={1}>круто</Col>
                                            <Col l={12} m={12} s={12} className="input-field col s12">
                                        <textarea id="meeting-feedback" className="materialize-textarea" name="message"
                                                  placeholder="оценка без содержательного комментария &mdash; достаточно бесполезная штука"
                                                  onChange={e => {
                                                      this.setState({feedback_message: e.target.value})
                                                  }}
                                        />
                                            </Col>
                                            <Col l={12} m={12} s={12}><Info
                                                message="этот отзыв не будет доступен никому кроме администрации школы"/>
                                            </Col>
                                        </Col>
                                    </Col>
                                    : ''
                                }
                            </Col>
                        </Modal> : ''
                    }
                </Row>
            )
        }
        else
            return (
                <div>
                    <h1>Загрузка...</h1>
                    <p>(если вы видите этот текст более 30ти секунд, то проверьте своё интернет-соединение или напишите нам на
                        <a href={`mailto:${ADMIN_MAIL}`} target="_blank">{ADMIN_MAIL}</a></p>
                </div>
            )

    }
}

export default Dashboard
