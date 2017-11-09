import React, {Component} from 'react'
import {Card, Col, Collection, Modal, Row} from "react-materialize";
import {MATERIALS_URL} from "../constants";

class ProfileInfo extends Component {
    constructor() {
        super();

        this.state = {
            take_vacation_opened: false,
            materials_opened: false
        }
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
                            <div>предупреждений: {user.warnings.length || '0'}
                                &nbsp;из {user.warnings_max} {user.warnings.length ? "" : "(круто!)"}</div>
                            <div>выходных: {user.vacations.available}
                                из {user.vacations.available + user.vacations.taken} (
                                <Modal
                                    trigger={<a href="#">взять неделю</a>}>
                                    этот функционал пока не поддерживается, сорян
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
                            trigger={<a href="#">материалы по курсу</a>}>
                            <div id="courseMaterials">
                                <Row className="modal-content">
                                    <h4>Материалы для курса SCS</h4>
                                    <Col l={6} s={12}>
                                        <Collection className="with-header white">
                                            <h5 className="collection-header">Общие документы</h5>
                                            <ul className="col l12">
                                                <li><a
                                                    href="https://docs.google.com/document/d/1CG3S8C1fQd1dtiqtYcq1rvjjKRJF5cIuWwxUKaXN5xM/edit"
                                                    target="_blank" rel="noopener noreferrer">
                                                    Для всех учеников</a></li>
                                                <li><a href={MATERIALS_URL + 'handout00'} target="_blank" rel="noopener noreferrer">Информация о
                                                    курсе</a></li>
                                                <li><a href={MATERIALS_URL + 'handout01'} target="_blank" rel="noopener noreferrer">План</a></li>
                                                <li><a href={MATERIALS_URL + 'handout02'} target="_blank" rel="noopener noreferrer">Выбор
                                                    курса</a>
                                                </li>
                                                <li><a href={MATERIALS_URL + 'handout03'} target="_blank" rel="noopener noreferrer">Кодекс
                                                    чести</a></li>
                                                <li><a href={MATERIALS_URL + 'handout06'} target="_blank" rel="noopener noreferrer">Культура
                                                    реалтайм общения</a></li>
                                                <li><a href={MATERIALS_URL + 'handout04'} target="_blank" rel="noopener noreferrer">IDE</a></li>
                                                <li><a href={MATERIALS_URL + 'handout05'} target="_blank" rel="noopener noreferrer">Karel</a></li>
                                                <li><a href={MATERIALS_URL + 'handout09'} target="_blank" rel="noopener noreferrer">Типичное,
                                                    основы</a></li>
                                                <li><a href={MATERIALS_URL + 'handout15'} target="_blank" rel="noopener noreferrer">Стиль</a></li>
                                            </ul>
                                        </Collection>
                                    </Col>
                                    <Col l={6} s={12}>
                                        <Collection className="collection with-header white">
                                            <h5 className="collection-header">Ресурсы</h5>
                                            <ul className="col l12">
                                                <li><a href="http://eclipse.org" target="_blank" rel="noopener noreferrer">
                                                    Eclipse</a> и <a href="https://www.jetbrains.com/idea/download/"
                                                                     target="_blank" rel="noopener noreferrer">IntelliJ Idea</a></li>
                                                <li><a href="http://google.com" target="_blank" rel="noopener noreferrer">
                                                    документация</a></li>
                                                <li><a
                                                    href="http://web.stanford.edu/className/archive/cs/cs106a/cs106a.1144/materials/karel-the-robot-learns-java.pdf"
                                                    target="_blank" rel="noopener noreferrer">
                                                    Karel Book</a></li>
                                                <li><a
                                                    href="http://people.reed.edu/~jerry/121/materials/artsciencejava.pdf"
                                                    target="_blank" rel="noopener noreferrer">
                                                    Art and Science Of Java</a> + <a
                                                    href="http://cs.stanford.edu/people/eroberts/books/ArtAndScienceOfJava/"
                                                    target="_blank" rel="noopener noreferrer">материалы</a></li>
                                                <li><a href={MATERIALS_URL + 'some-code-templates'} target="_blank" rel="noopener noreferrer">заготовки</a>
                                                </li>
                                            </ul>
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