import React, {Component} from 'react'
import {Info, Notification, Warn} from "./Notifications";
import {togglePreview} from "../methods";
import {ADMIN_MAIL, AVATARS_PATH, HOMEWORKS_PATH, P2P_MANUAL_URL} from "../constants";
import Table from "./Table";
import {Button, Col, Input, Modal, Row} from "react-materialize";
import axios from 'axios'
import EvaluateModal from "./EvaluateModal";

class PersonInfoPreview extends Component {

    render() {
        const user = this.props.user,
              user_id = this.props.user_id
        return (
            <div className="preview hidden" id={'preview-' + user_id}>
                <div className="pointer"/>
                <div className="close float-right" onClick={togglePreview}><i data-id={user_id}
                                                                              className="fa fa-times"/></div>
                <div className="pointer_in"/>
                <a href={AVATARS_PATH + user.avatar_url} target="_blank" rel="noopener noreferrer"><img src={AVATARS_PATH + user.avatar_url}
                                                                              alt={user.name + " " + user.surname}/></a>
                <div>{user.name} {user.surname}</div>
                <div><a href={'tel:' + user.phone}>{user.phone}</a></div>
                <div><a href={'mailto:' + user.email}>{user.email}</a></div>
                {user.telegram_id ?
                    <div><a href={'tg://resolve?domain=' + user.telegram_id}><i
                        className="fa fa-telegram"/>&nbsp;{user.telegram_id}</a></div>
                    : ('')
                }
            </div>
        )
    }
}

class Person extends Component {
    constructor(){
        super();
        this.state = {
            review_place: 1,
            online_fault: ''
        }
        this.startReview = this.startReview.bind(this);
        this.reviewPlace = this.reviewPlace.bind(this);
        this.cancelReviewer = this.cancelReviewer.bind(this);
    }

    reviewPlace(){
        this.startReview();
        const online = parseInt(this.state.review_place) !== 1;
        axios({
            method: 'post',
            url: 'review-place',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                online: online,
                week: this.props.week_data.info.number,
                type: 'done',
                reviewed_id: this.props.user_id,
                online_fault: this.state.online_fault

            }
        }).then(res=>{
            if(res)
                console.log(res);
            document.getElementById('refresh-button').click()
        })
    }

    startReview(){
        axios.get('start-review', {
            params: {
                receiver_id: this.props.user_id,
                week: this.props.week_data.info.number
            }
        })
            .then((res)=>{
                console.log(res)
            })
    }
    cancelReviewer(){
        axios({
            url:'change-reviewer-request',
            method: 'post',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                bad_user_id: this.props.user_id,
                week: this.props.week_data.info.number,
                message: this.state.cancel_reason,
                user_id: this.props.my_id
            }
        }).then(res=> {
            console.log(res);
            document.getElementById('change-reviewer-success').click()
        })
    }

    render() {
        const user = this.props.user, 
              review_data = this.props.review_data, 
              is_reviewer = this.props.is_reviewer,
              user_id = this.props.user_id,
              my_id = this.props.my_id,
              week_data = this.props.week_data,
              review_calculated = this.props._review
        return (
            <Row className="paddinged">
                <Col className=" review_avatar" l={1} m={1} s={1}>
                    <img src={AVATARS_PATH + user.avatar_url} alt={user.name + " " + user.surname} data-id={user_id}
                         onClick={togglePreview}/>
                    <PersonInfoPreview user={user} user_id={user_id}/>
                </Col>
                <Col l={11} m={11} s={11}>
                    <div>
                        <strong>{user.name} {user.surname}</strong> 
                        {is_reviewer ?
                            <span>
                                &nbsp;
                                <a href={HOMEWORKS_PATH + user_id + '/' + review_data.homeworks[0]}>скачать код #1</a>
                                &nbsp;
                                {review_data.homeworks[1] &&
                                <a href={HOMEWORKS_PATH + user_id + '/' + review_data.homeworks[1]}>скачать код #2</a>
                                }
                            </span>
                            :('')
                        }
                        </div>
                    <div>
                        <a href={'tel:' + user.phone}>{user.phone}</a>,&nbsp;
                        <a href={'mailto:' + user.email}>{user.email}</a>
                        {user.telegram_id ?
                            <span>, <a href={'tg://resolve?domain=' + user.telegram_id}><i
                                className="fa fa-telegram"/>&nbsp;{user.telegram_id}</a>
                                </span>
                            : ('')
                        }
                        {review_data.online_request ?
                            <span className="grey-text">
                            &nbsp;&nbsp;&nbsp;
                                <Info message='вынужден общаться онлайн'/>
                                &nbsp;(<a href={P2P_MANUAL_URL + '#bookmark=id.jnlx1h9txek3'} target="_blank"
                                          rel="noopener noreferrer">что это значит?</a>)
                            </span>
                            : ''
                        }
                    </div>
                    <div><strong>Доступность: </strong>{review_data.availability}</div>
                </Col>
                <Col l={12} m={12} s={12}>
                    {review_data.review_started ? (
                        <div>
                            <br/>
                            {!is_reviewer ? <div><strong>Вам поставили следующие оценки:</strong></div> : ""}
                            <Table review_number={review_calculated._number === 2 ? 1 : 0}
                                is_reviewer={is_reviewer} review_data={review_data.reviews} receiver_id={user_id}
                                week_data={week_data} author_id={my_id}/>
                            <br/>
                            {<div className='grey-text'>
                                <Info message={
                                parseInt(review_data.review_place_initiator) ?
                                    (
                                        parseInt(review_data.review_place_initiator) === parseInt(user_id) ?
                                            (
                                                is_reviewer ?
                                                    'Первое ревью проводится онлайн по просьбе вашего ревьювера'
                                                    :'Первое ревью проводится онлайн по просьбе проверяемого'
                                            )
                                            : 'Первое ревью проводится онлайн по вашей просьбе'

                                    )
                                    : 'Первое ревью проходит офлайн.'
                            }/>
                            </div>}
                            <br/>
                            {review_data.review_feedback && (typeof review_data.review_feedback === 'boolean' ? true :  review_data.review_feedback.length) ?
                                (!is_reviewer ?
                                        <div>
                                            {review_data.review_feedback.map(feedback =>
                                                <div key={feedback.message}>
                                                    <strong>Вы: </strong> оценка {feedback.mark}, {feedback.message}
                                                </div>
                                            )}
                                            <div>
                                            <EvaluateModal week={week_data.info.number} mark_type="3"
                                                           trigger={<Button>поменять оценку за ревью</Button>}
                                                           header="Вы ставите оценку за ревью"
                                                           action="setMark" receiver={user_id}
                                                           author_id={my_id}
                                            />
                                            <span className="grey-text">
                                                <Info message="эту оценку вы ставите за то, как было проведено ревью"/></span>
                                            </div>
                                        </div>
                                        : ""
                                ) :
                                (is_reviewer ?
                                        <div className="grey-text">
                                            <Warn
                                            message='вам ещё не поставили ответную оценку. Убедитесь, что её поставят до конца периода ревью'/>
                                        </div>
                                        :
                                        <div>
                                            <EvaluateModal week={week_data.info.number} mark_type="3"
                                                       trigger={<Button>Поставить оценку за ревью</Button>}
                                                       header="Вы ставите оценку за ревью"
                                                       action="setMark" receiver={user_id}
                                                       author_id={my_id}
                                            />
                                            <span className="grey-text">
                                                <Info message="эту оценку вы ставите за то, как было проведено ревью"/>
                                            </span>
                                        </div>
                                )
                            }
                        </div>
                    ) : is_reviewer ? (
                        <div>
                            <Modal
                                trigger={<Button waves='light'>Начать ревью</Button>}
                                actions={
                                    <Button waves="light" onClick={this.reviewPlace} modal="close">
                                        Начать
                                    </Button>
                                }
                            >
                                <div>Как проходите ревью?</div>

                                <Input type="radio" name="review_place" value="1"  className="with-gap float-left"
                                       onChange={e => {this.setState({review_place: e.target.value}) }}
                                       checked={this.state.review_place === "1"}
                                       label="оффлайн, сидим тут вместе :)"
                                />
                                <Input type="radio" name="review_place" value="2"  className="with-gap float-left"
                                       onChange={e => {
                                           this.setState({
                                               review_place: e.target.value,
                                               online_fault: my_id
                                           })

                                       }}
                                       checked={this.state.review_place === "2"}
                                       label="онлайн, голосом, по моей просьбе"
                                />
                                <Input type="radio" name="review_place" value="3"  className="with-gap float-left"
                                       onChange={e => {
                                           this.setState({
                                               review_place: e.target.value,
                                               online_fault: user_id
                                           })
                                       }}
                                       checked={this.state.review_place === "3"}
                                       label="онлайн, голосом, по просьбе проверяемого"
                                />
                                <Input type="radio" name="review_place" value="4"  className="with-gap float-left"
                                       onChange={e => {this.setState({review_place: e.target.value}) }}
                                       checked={this.state.review_place === "4"}
                                       label="буду ставить оценки не проведя полноценного ревью" disabled
                                />
                            </Modal>
                            &nbsp;
                            <span className='grey-text'>
                                <Info message='Не получается встретиться ни онлайн ни оффлайн?'/>
                                    &nbsp;срочно&nbsp;<a href={"mailto:" + ADMIN_MAIL}>пишите нам</a>
                            </span>
                        </div>
                    ) : (<strong>Пользователь пока не начал ревью</strong>)}
                </Col>
                {review_calculated._review && review_calculated._number === 1 && !is_reviewer ?
                    <Col l={12} m={12} s={12}>
                        <Modal
                            header="Вы уверены? ревьювера можно поменять, если:"
                            trigger={<Button className="btn-flat">Попросить другого ревьюера</Button>}
                            actions={[
                                <Button waves='light' modal="close" onClick={this.cancelReviewer} key="t">Уверен</Button>,
                                <Button modal="close" key="tt">х</Button>
                            ]}
                        >
                            <ul>
                                <li>он не вышел на связь</li>
                                <li>он вышел на связь, но объяснил, что не может участвовать</li>
                                <li>у вас не получается договориться о совместной встрече</li>
                                <li>другая очень важная причина</li>
                            </ul>
                            <label htmlFor="cancel_reason">
                                Кто когда и с кем созвонился, что говорил и причина запроса:
                            </label>
                            <textarea name="cancel_reason" id="cancel_reason"
                                      onChange={e => this.setState({cancel_reason: e.target.value})}/>
                        </Modal>
                    </Col>
                    : ''
                }
                <Modal
                    trigger={<button className="hidden" id="change-reviewer-success"/>}
                >
                    Мы обработаем вашу заявку, вам придёт письмо.
                </Modal>
            </Row>
        )
    }
}

export default Person