import React, {Component} from 'react'
import {Button, Card, Col, Collection, CollectionItem, Modal, Row} from "react-materialize";
import {A_MATERIALS_URL} from "../constants";
import axios from 'axios'

class ProfileInfo extends Component {
    constructor() {
        super();

        this.state = {
            take_vacation_opened: false,
            materials_opened: false
        }
        this.takeVacation = this.takeVacation.bind(this)
    }

    takeVacation(){
        axios.post('vacation-request', {
            _token: document.querySelector('meta[name=csrf-token]').content,
            want_vacation: this.props.vacation_countdown !== 3 || this.props.vacation_countdown === 0
        })
            .then(() => {
                window.location.reload();
            })
    }

    render() {
        const user = this.props.user
        return (
            <Row>
                <h3>Привет!</h3>
                <Card className="col l12 m12 s12 white">
                    {!this.props.volunteer ?
                        <div>
                            <div><strong>немного инфы о вас:</strong></div>
                            <div>предупреждений: {user._warnings_amount || '0'}
                                &nbsp;из {user.warnings_max} {user._warnings_amount ? "" : "(круто!)"}</div>
                            <div>выходных: {user.vacations.available}&nbsp;
                                из {user.vacations.available + user.vacations.taken} (
                                <Modal
                                    trigger={<a href="#">взять неделю</a>}
                                    actions={
                                        [
                                            <Button modal="close" className="close-button">х</Button>
                                            , <Button modal="close" className={this.props.vacation_countdown > 0 && this.props.vacation_countdown < 3 ? 'hidden' : ''}  onClick={this.takeVacation}>Подтвердить</Button>]
                                    }>
                                    {/*Этот функционал пока не поддерживается.*/}
                                    {this.props.vacation_countdown > 0 && this.props.vacation_countdown < 3 ?
                                            <span>Вы уже взяли отпуск</span>:
                                            <span>
                                                Вы хотите {this.props.vacation_countdown !== 3 ? 'взять' : 'отменить'}  отпуск на период {user._vacation_period}?
                                                {this.props.vacation_countdown !== 3 ?
                                                    <div><br/>
                                                        Учтите: если вы возьмете отпуск, то сможете его отменить только до окончания той недели, на которой он был взят.<br/>
                                                        Вы сможете взять еще одну неделю только после того, как закончится текущий отпуск.<br/>
                                                        Например, если вы забронируете отпуск на 2-ой неделе, вы:<br/>
                                                        - сможете отменить его только на 2-ой неделе;<br/>
                                                        - выйдете в отпуск на 4-ой неделе;<br/>
                                                        - взять новый отпуск сможете на 5-ой неделе, следовательно он будет на 7-ой неделе<br/>
                                                    </div> : null
                                                }
                                            </span>
                                    }
                                </Modal>
                                )
                            </div>
                            {user.current_week > 1 ? <div>средний балл: {user.average_mark}</div> : ''}
                            <br/>
                        </div>
                        : ''
                    }
                    <div><strong>полезные ссылки:</strong></div>
                    <div>
                        <Modal
                            trigger={<a href="#">материалы по курсу</a>}
                            actions={
                                <Button modal="close" className="close-button">х</Button>
                            }>
                            <div id="courseMaterials">
                                <Row>
                                    <h4>Материалы для курса SCS</h4>
                                    <Col l={6} s={12}>
                                        <Collection
                                            className="with-header white"
                                            header={<h5>Общие документы</h5>}
                                        >
                                            <CollectionItem><a
                                                href="https://docs.google.com/document/d/1CG3S8C1fQd1dtiqtYcq1rvjjKRJF5cIuWwxUKaXN5xM/edit"
                                                target="_blank" rel="noopener noreferrer">
                                                Для всех учеников</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout00'} target="_blank" rel="noopener noreferrer">Информация о
                                                курсе</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout01'} target="_blank" rel="noopener noreferrer">План</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout02'} target="_blank" rel="noopener noreferrer">Выбор
                                                курса</a>
                                            </CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout03'} target="_blank" rel="noopener noreferrer">Кодекс
                                                чести</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout06'} target="_blank" rel="noopener noreferrer">Культура
                                                реалтайм общения</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout04'} target="_blank" rel="noopener noreferrer">IDE</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout05'} target="_blank" rel="noopener noreferrer">Karel</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout09'} target="_blank" rel="noopener noreferrer">Типичное,
                                                основы</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'handout15'} target="_blank" rel="noopener noreferrer">Стиль</a></CollectionItem>
                                        </Collection>
                                    </Col>
                                    <Col l={6} s={12}>
                                        <Collection
                                            className="collection with-header white"
                                            header={<h5>Ресурсы</h5>}
                                        >
                                            <CollectionItem><a href="http://eclipse.org" target="_blank" rel="noopener noreferrer">
                                                Eclipse</a> и <a href="https://www.jetbrains.com/idea/download/"
                                                                 target="_blank" rel="noopener noreferrer">IntelliJ Idea</a></CollectionItem>
                                            <CollectionItem><a href="http://google.com" target="_blank" rel="noopener noreferrer">
                                                документация</a></CollectionItem>
                                            <CollectionItem><a
                                                href="http://programming.kr.ua/download/karel-the-robot-learns-java.pdf"
                                                target="_blank" rel="noopener noreferrer">
                                                Karel Book</a></CollectionItem>
                                            <CollectionItem><a
                                                href="http://people.reed.edu/~jerry/121/materials/artsciencejava.pdf"
                                                target="_blank" rel="noopener noreferrer">
                                                Art and Science Of Java</a> + <a
                                                href="http://cs.stanford.edu/people/eroberts/books/ArtAndScienceOfJava/"
                                                target="_blank" rel="noopener noreferrer">материалы</a></CollectionItem>
                                            <CollectionItem><a href={A_MATERIALS_URL + 'some-code-templates'} target="_blank" rel="noopener noreferrer">заготовки</a>
                                            </CollectionItem>
                                        </Collection>
                                    </Col>
                                </Row>
                            </div>
                        </Modal>
                    </div>
                </Card>
            </Row>
        )
    }
}

export default ProfileInfo