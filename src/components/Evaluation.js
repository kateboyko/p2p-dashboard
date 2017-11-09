import React, {Component} from 'react'
import Person from "./Person";
import {Col, Row, Tab, Tabs} from "react-materialize";
import Table from "./Table";

class Evaluation extends Component {
    constructor(){
        super();
        this.state = {
            active_tab: 1
        }
    }
    render() {
        const reviewers = this.props.reviewers,
            reviewed = this.props.reviewed,
            week_data = this.props.week_data,
            users = this.props.users,
            review_index = this.props.week_data._reviews[0]._review ? 0 : 1
        return (
            <Row className="paddinged">
                {!this.props.volunteer && reviewers.length ?
                    <div>
                        <h4>Ваш код смотрят:</h4>
                        {(week_data._finished) ? (
                                <div>
                                    <div><strong>Вам поставили следующие оценки:</strong></div>
                                    {
                                        reviewers.map(participant =>
                                            <div>
                                                <br/>
                                                <Table review_number={1}
                                                       is_reviewer={false} review_data={participant.reviews}
                                                       key={'final-' + participant.id}
                                                       receiver_id={participant.id}
                                                       week_data={week_data}/>
                                                <br/>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                            :
                            reviewers.map(participant => {
                                const user = users[participant.id];
                                return (
                                    <Col key={participant.id} l={12} m={12} s={12}>

                                        <Person _review={this.props.week_data._reviews[review_index]} user={user}
                                                user_id={participant.id} review_data={participant}
                                                is_reviewer={false}
                                                week_data={week_data} my_id={this.props.my_id}/>
                                    </Col>
                                )
                            })
                        }
                    </div> :''
                }
                {!week_data._finished && reviewed.length ?
                    <div>
                        <h4>Вы смотрите код этих людей</h4>
                        {!week_data._finished ?
                            reviewed.map(participant => {
                                const user = users[participant.id];
                                return (
                                    <Col key={participant.id} l={12} m={12} s={12}>
                                        <Person _review={this.props.week_data._reviews[review_index]} user={user}
                                                user_id={participant.id} review_data={participant}
                                                is_reviewer={true}
                                                week_data={week_data} my_id={this.props.my_id}/>
                                    </Col>
                                )
                            }) : ''
                        }
                    </div> :''
                }
            </Row>
        )
    }
}

export default Evaluation