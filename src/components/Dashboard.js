import React, {Component} from 'react'

import {ADMIN_MAIL, FEEDBACK_FORM_URL, JSON_URL, P2P_MANUAL_URL} from "../constants"
import {refactorData, refactorLinks, refactorMarkdown} from "../methods"

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
        this.setState({availability: document.getElementById('availability').value})
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
            this.state.editing = false;
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
            window.location.reload();
        })
    }

    sendFeedback() {
        let feedback;
        if (parseInt(this.state.status) === 3) {
            feedback = document.getElementById('meeting-feedback').value;
            if (!feedback || feedback.replace(/\s/g, "").length < 50) {
                alert('Маловат комментарий: минимум 50 символов. вы ввели: ' + (feedback && feedback.length ? feedback.replace(/\s/g, "").length : '0'))
                return
            }
            if (!this.state.mark) {
                alert('Укажите, пожалуйста, оценку.')
                return
            }
        }
        if (parseInt(this.state.status) === 2) {
            let date = new Date(new Date().getTime() + 60 * 1000 * 60);
            document.cookie = "hideFeedback=true; path=/; expires=" + date.toUTCString();
            document.getElementById('meeting-feedback-close').click();
            return;
        }
        axios({
            method: 'post',
            url: 'meeting-feedback',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                status: this.state.status,
                mark: this.state.mark,
                message: feedback,
                week: this.state.user.current_week,
                'meeting-number': this.state._feedback_form._meetup
            }
        }).then(()=>{
            document.getElementById('meeting-feedback-close').click()
        })
    }

    updateData() {
        axios.get(JSON_URL + "?ajax=true")
            .then(res => {
                this.setState(refactorData(res.data.data), () => {
                    refactorLinks();
                    if(this.state.volunteer)
                        this.setState({
                            availability:
                                    this.state.volunteer._settings_compiled.availability ||
                                    this.state.availability,
                            max_students_to_review: this.state.volunteer._settings_compiled.max_students_to_review
                        })
                    if(this.state._feedback_form && this.state._feedback_form._visible)
                        document.getElementById('feedback_modal_trigger').click();
                })
            })
    }

    componentDidMount() {
        this.updateData()
        setTimeout(()=> {
                document.getElementsByTagName('body')[0].click();
                document.querySelectorAll('.active').forEach(a => a.click());
                setInterval(document.getElementById('refresh-button').click, 60*60*1000);
            }, 500)
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
                            <ProfileInfo user={data.user} volunteer={data.volunteer} vacation_countdown={parseInt(data.now.vacation_countdown)}/>
                        </div>

                        <div className="col l9 m12 s12">
                            <h3>Сейчас неделя <span>{~~data.now.vacation_countdown === 2 ? 'перед отпуском' : ~~data.now.vacation_countdown === 1 ? 'отпуска' : data.user.current_week}</span>, план такой:</h3>
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
                                            trigger={<a href="#">визуальную схему</a>}
                                            actions={
                                                <Button modal="close" className="close-button">х</Button>
                                            }>
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
                            <Card className="grey lighten-3 volunteer-settings">
                                <Row>
                                    <Col l={6} m={6} s={6}>Сколько человек вы готовы взять на себя в ближайшую
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
                                            <strong>{data.volunteer._incomplete_reviews || 0} человек.</strong></div>
                                    </Col>
                                </Row>
                                {!volunteer_data._settings_compiled._editable && volunteer_data.ongoing_review_registration ?
                                    <Modal
                                        trigger={<Button waves='light'>отменить своё участие в ревью</Button>}
                                        header="Вы уверены, что хотите отменить своё участие?"
                                        actions={[<Button modal="close" waves='light'>Ой, я передумал</Button>, <Button modal="close" waves='light' className="red lighten-1" onClick={this.cancelParticipation}>Подтверждаю</Button>]}
                                    >
                                        <p>Хорошо подумайте перед тем, как отменять свое участие в ревью &mdash; вы можете подвести нашего студента.</p>
                                        <p>Попробуйте договориться с учащимися, возможно не всё так плохо?</p>

                                    </Modal>
                                    :''
                                }
                                {parseInt(volunteer_data._settings_compiled.max_students_to_review) ?
                                    <Row>
                                        <Col l={6} m={12} s={12}>
                                            <CheckboxForm text="участвую в ревью (и первом и втором) на этой неделе"
                                                          name="confirm_review" action="confirm-part"
                                                          checked={volunteer_data._settings_compiled._is_review || volunteer_data._settings_compiled.review_confirmed}
                                                          disabled={!volunteer_data._settings_compiled._editable}/>
                                        </Col>
                                        <Col l={6} m={12} s={12}>
                                            <CheckboxForm text="вынужден участвовать удалённо"
                                                          name="review-place" action="review-place"
                                                          checked={volunteer_data._settings_compiled.online_request}
                                                          disabled={!volunteer_data._settings_compiled._editable}/>
                                            (<a target="_blank" href={P2P_MANUAL_URL + '#bookmark=id.jnlx1h9txek3'}>чем
                                            это плохо</a>)
                                        </Col>
                                        <Row className="col l12 m12 s12">
                                            {volunteer_data._settings_compiled.availability && !this.state.editing && !volunteer_data._settings_compiled.editable ? (
                                                <Col l={12} m={12} s={12}>
                                                    <i className="fa fa-pencil-square-o" aria-hidden="true"
                                                       onClick={(e) => {
                                                           e.preventDefault();
                                                           this.setState({editing: true})
                                                       }}
                                                    />&nbsp;&nbsp;
                                                    <strong>Ваша доступность на ревью:</strong>&nbsp;
                                                    <i>{this.state.availability}</i>
                                                </Col>
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
                                        </Row>
                                    </Row> : ''
                                }
                            </Card>
                        </Row>
                        : ''
                    }
                    <Row>
                        <h3>Недели</h3>
                        <Collapsible>
                            {data.weeks.map((week, i) => {
                                    return week._started ?
                                        <CollapsibleItem header={
                                                <strong className={week._finished ? '' : 'active'}>
                                                    Неделя #{week.info.number}&nbsp;
                                                    {!data.volunteer ?
                                                        <span>
                                                            {week._contacts_list_arrival._opened && !week._finished ? ' ИДЁТ РЕВЬЮ! ' : ""}
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
                                                </strong>
                                        } key={week.id} icon="expand_more" >
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
                            actions={
                                [<Button id="meeting-feedback-submit"
                                        className="float-right" waves="light"
                                        onClick={this.sendFeedback}>отправить
                                </Button>,
                                   <Button id="meeting-feedback-close" className="hidden" modal="close"/> ]
                            }
                            modalOptions={{dismissible: false}}
                        >
                            <Row>
                                <h4>Привет! Оставьте, пожалуйста, отзыв о прошедшей встрече :)</h4>
                                <div>(она была
                                    в {data._feedback_form._meetup === 1 ? 'понедельник' : 'среду'}, {data._feedback_form._date})
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
                                    {parseInt(this.state.status) === 3 ?
                                        <Col className="row paddinged" id="evaluate-meeting">
                                            <Col className="col l10 offset-l1">
                                                <Col l={2} m={2} s={2}>бесполезно</Col>
                                                <Col l={1} m={1} s={1}>
                                                    <Input type="radio" checked={+this.state.mark === 1}
                                                           onChange={e => {
                                                               this.setState({mark: e.target.value})
                                                           }} name="mark" value="1"
                                                           className="with-gap"
                                                           label={<span className="radio-point-label">1</span>}/>
                                                </Col>
                                                <Col l={1} m={1} s={1}>
                                                    <Input type="radio" checked={+this.state.mark === 2}
                                                           onChange={e => {
                                                               this.setState({mark: e.target.value})
                                                           }} name="mark" value="2"
                                                           className="with-gap"
                                                           label={<span className="radio-point-label">2</span>}/>
                                                </Col>
                                                <Col l={1} m={1} s={1}>
                                                    <Input type="radio" checked={+this.state.mark === 3}
                                                           onChange={e => {
                                                               this.setState({mark: e.target.value})
                                                           }} name="mark" value="3"
                                                           className="with-gap"
                                                           label={<span className="radio-point-label">3</span>}/>
                                                </Col>
                                                <Col l={1} m={1} s={1}>
                                                    <Input type="radio" checked={+this.state.mark === 4}
                                                           onChange={e => {
                                                               this.setState({mark: e.target.value})
                                                           }} name="mark" value="4"
                                                           className="with-gap"
                                                           label={<span className="radio-point-label">4</span>}/>
                                                </Col>
                                                <Col l={1} m={1} s={1}>
                                                    <Input type="radio" checked={+this.state.mark === 5}
                                                           onChange={e => {
                                                               this.setState({mark: e.target.value})
                                                           }} name="mark" value="5"
                                                           className="with-gap"
                                                           label={<span className="radio-point-label">5</span>}/>
                                                </Col>
                                                <Col l={1} m={1} s={1}>круто</Col>
                                                <Col l={12} m={12} s={12} className="input-field col s12">
                                                    <textarea id="meeting-feedback" rows="3" name="message"
                                                              placeholder="оценка без содержательного комментария &mdash; достаточно бесполезная штука"
                                                    />
                                                </Col>
                                                <Col l={12} m={12} s={12}><Info
                                                    message="этот отзыв не будет доступен никому кроме администрации школы"/>
                                                </Col>
                                            </Col>
                                        </Col>
                                        : ''
                                    }
                                    <Input type="radio" name="status" value="4" className="with-gap float-left"
                                           onChange={e => {
                                               this.setState({status: e.target.value})
                                           }}
                                           checked={+this.state.status === 4}
                                           label={
                                               <a href={FEEDBACK_FORM_URL} target="_blank"
                                                  rel="noopener noreferrer"
                                                  id="google-form-feedback">оставить анонимный
                                                   &nbsp;отзыв</a>
                                           }
                                    />
                                </Row>
                            </Row>
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
