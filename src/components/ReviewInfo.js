import React, {Component} from 'react'
import {ADMIN_MAIL, MATERIALS_URL, P2P_MANUAL_URL} from "../constants";
import CheckboxForm from "./CheckboxForm";
import {Button, Col, Input, Modal, ProgressBar, Row} from "react-materialize";
import {Info, Warn} from "./Notifications";
import axios from 'axios'

const FileUpload = require('react-fileupload');

class ReviewInfo extends Component {

    constructor() {
        super();
        this.state = {
            upload_state: 'allowed',
            selected_file_name: '',
            upload_options: {
                baseUrl: 'upload_homework',
                accept: "application/zip",
                requestHeaders: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
                },
                fileFieldName: 'homework',
                chooseFile: (files) => {
                    this.setState({
                        selected_file_name: typeof files === 'string' ? files : files[0].name
                    })
                    console.log('you choose', typeof files === 'string' ? files : files[0].name)
                },
                beforeUpload: (files, mill) => {
                    if (typeof files === 'string') return true
                    if (files[0].size < 1024 * 1024 * 20) {
                        files[0].mill = mill
                        return true
                    }
                    return false
                },
                doUpload: (files, mill) => {

                    //    check here the time to be before deadline data
                },
                uploading: (progress) => {
                    this.setState({
                        upload_state: 'uploading',
                        upload_progress: progress.loaded / progress.total
                    })
                },
                uploadSuccess: (resp) => {
                    if(resp.success) {
                        console.log('upload success..!')
                        console.log(resp);
                        this.setState({
                            upload_state: 'upload_success'
                        })
                        document.getElementById('refresh-button').click()
                    }
                    else{
                        this.setState({
                            upload_state: 'upload_failed'
                        })
                        alert('error:' + resp.message)
                    }

                },
                uploadError: (err) => {
                    this.setState({
                        upload_state: 'upload_failed'
                    })
                    alert('error:' + err.message)
                },
                uploadFail: (resp) => {
                    this.setState({
                        upload_state: 'upload_failed'
                    })
                    alert('fail' + resp)
                }
            }
        }
        this.saveAvailability = this.saveAvailability.bind(this)
        this.cancelParticipation = this.cancelParticipation.bind(this)
        this.handleAvailabilityChange = this.handleAvailabilityChange.bind(this)

    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        this.setState({
            upload_state: nextProps.data._accepting ? 'allowed' : ''
        })
    }
    componentDidMount(){
        let t = this.state;
        t.upload_options.paramAddToField = {
            _token: document.querySelector('meta[name=csrf-token]').content,
            week_number: this.props.week_data.info.number
        }

        t.editing = false
        this.setState(t);
    }

    handleAvailabilityChange(e){
        this.setState({availability: e.target.value})
    }

    saveAvailability(){
        axios({
            method: 'post',
            url: 'available-for-review',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                week_number: this.props.week_data.info.number,
                message: this.state.availability
            }
        }).then(res=>{
            this.setState({editing: false})
            console.log(res);
            document.getElementById('refresh-button').click()
        })
    }
    cancelParticipation(){
        axios({
            method: 'post',
            url: 'delete-user-from-review',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                bad_user_id: this.props.my_id,
                week: this.props.week_data.info.number
            }
        }).then(res=>{
            console.log(res);
            document.getElementById('refresh-button').click()
        })
    }

    render() {
        const number = this.props.number,
            week_data = this.props.week_data,
            data = this.props.data;
        this.state.availability = this.state.availability ||
            this.state.editing ? this.state.availability
            : this.props.week_data.review_registration.availability
        return (
            <Row>
                <div>
                    <strong>{number === 1 ? "Первое" : "Второе"} ревью: </strong>&nbsp;
                    <span dangerouslySetInnerHTML={{__html: data._header}}/>
                    {/*({data._status})*/}
                </div>
                {!data._finished &&
                <Col l={12} m={12} s={12}>
                    {data._accepting &&
                    <div>
                        <Modal
                            trigger={
                                <span>
                                    <Button waves="light"
                                            onClick={() => {
                                                this.setState({
                                                    upload_state: data._accepting ? 'allowed' : ''
                                                })
                                            }}>
                                        {data._code_was_uploaded ? "Перезалить " : "Залить "}
                                        код в .zip архиве
                                    </Button>
                                </span>
                            }>
                            <div id="uploadHW">
                                <Row>
                                    <Col l={12} m={12} s={12}>
                                        {this.state.upload_state === 'allowed' &&
                                        <FileUpload options={this.state.upload_options} className="row">
                                            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]').content}/>
                                            <input type="hidden" name="week_number" value={week_data.info.number}/>
                                            <Button waves="light" ref="chooseBtn">выбрать файл с домашним
                                                заданием</Button>
                                            <Button waves="light" ref="uploadBtn">Отправить</Button>
                                            <Input value={this.state.selected_file_name}/>
                                        </FileUpload>
                                        }
                                        {this.state.upload_state === 'uploading' &&
                                        <div>
                                            <Col s={12} m={12} l={12}>загружаю... ждите</Col>
                                            <Col s={12} m={12} l={12}>
                                                <ProgressBar progress={this.state.upload_progress}/>
                                            </Col>
                                        </div>
                                        }
                                        {this.state.upload_state === 'upload_success' &&
                                        <div>
                                            <div>Загружено: <strong>успешно</strong></div>
                                        </div>
                                        }
                                        {this.state.upload_state === 'upload_failed' &&
                                        <div>
                                            <div>Загружено: <strong>неуспешно:(</strong></div>
                                            <div>(обратитесь на <a href={'mailto:' + ADMIN_MAIL}
                                                                   target="_blank" rel="noopener noreferrer">{ADMIN_MAIL}</a>)
                                            </div>
                                        </div>
                                        }
                                    </Col>
                                </Row>
                            </div>
                        </Modal>
                        &nbsp;<a href={MATERIALS_URL + "how-to-upload"} target="_blank" rel="noopener noreferrer">как правильно заливать код?</a>
                        <div>
                            {data._code_was_uploaded &&
                            <div> перезаливать можно до: {data._code_submit_deadline} </div>}
                        </div>
                        {data._number === 2 &&
                        <div className="grey-text">
                            <Info
                                message="этот код будет доступен ревьюверам для скачивания только на втором ревью и никак не повлияет на первое"/>
                        </div>
                        }
                    </div>
                    }
                    {(data._regday || data._review) && data._code_was_uploaded &&
                    <Row>
                        {week_data.review_registration._show_cancel_participation_button &&
                            <Modal
                                trigger={<Button waves='light'>отменить своё участие в ревью</Button>}
                                header="Вы уверены, что хотите отменить своё участие?"
                                actions={[<Button modal="close" waves='light'>Ой, я передумал</Button>, <Button modal="close" waves='light' onClick={this.cancelParticipation}>Подтверждаю</Button>]}
                            >
                                <p>Это влечёт за собой +1 предупреждение и другие печальные последствия, согласно <a
                                    href={P2P_MANUAL_URL} target="_blank" rel="noopener noreferrer">мануалу</a>
                                </p>
                                <p>Попробуйте договориться с учащимися, возможно не всё так плохо?</p>

                            </Modal>
                        }
                        <Row>
                            {data._regday &&
                            <Col l={6} m={6} s={6}>
                                <CheckboxForm week_number={week_data.info.number}
                                              text="участвую в ревью (и первом и втором) на этой неделе"
                                              name="confirm_review" action="confirm-part"
                                              checked={week_data.review_registration.review_confirmed}
                                              disabled={!week_data.review_registration._opened}/>
                            </Col>
                            }
                            {data._registered &&
                            <Col l={6} m={6} s={6}>
                                <CheckboxForm week_number={week_data.info.number}
                                              text="вынужден участвовать удалённо"
                                              name="review-place" action="review-place"
                                              checked={week_data.review_registration.online_request}
                                              disabled={!week_data.review_registration._opened}/>
                                (<a target="_blank" href={P2P_MANUAL_URL + '#bookmark=id.jnlx1h9txek3'}>чем это плохо</a>)
                            </Col>
                            }
                        </Row>
                        {data._registered &&
                        <div>
                            {week_data.review_registration.availability && !this.state.editing ? (
                                <div><strong>Ваша доступность на ревью:</strong>&nbsp;
                                    <i>{this.state.availability}</i>
                                    <Button onClick={() => this.setState({editing: true})} className="float-right">Редактировать</Button>
                                </div>
                            ) : (
                                <div>
                                    <Col l={9} m={9} s={9}>
                                        {!this.state.availability &&
                                            <div className="red-text"><Warn message="вы не будете допущены к ревью, если поле снизу будет пустым"/></div>
                                        }
                                        <label htmlFor="availability">
                                            Опишите, когда и как вы можете проводить ревью, а когда не можете:
                                            (<a href={P2P_MANUAL_URL + '#bookmark=id.a3fs6o9u10gx'} target="_blank"
                                                rel="noopener noreferrer">
                                            что писать и зачем?</a>)
                                        </label>
                                        <textarea name="availability" id="availability" className="" onChange={this.handleAvailabilityChange} value={this.state.availability}>
                                        </textarea>
                                    </Col>
                                    <Col l={3} m={3} s={3}>
                                        <br/>
                                        {this.state.availability &&
                                            <Button waves='light' id="save_availability" onClick={this.saveAvailability}>Сохранить</Button>
                                        }
                                    </Col>
                                </div>
                            )}
                        </div>
                        }
                    </Row>
                    }
                </Col>
                }
            </Row>
        )
    }
}

export default ReviewInfo