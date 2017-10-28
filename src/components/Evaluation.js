import React, {Component} from 'react'
import Person from "./Person";
import {Col, Row, Tab, Tabs} from "react-materialize";
import Table from "./Table";

class Evaluation extends Component {
    render() {
        const reviewers = this.props.reviewers,
            reviewed = this.props.reviewed,
            week_data = this.props.week_data,
            users = this.props.users
        return (
            <Row className="paddinged">
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Ваш код смотрят" active tabWidth={6}>
                        {(week_data._finished) ?
                            reviewers.map(participant => {
                                return <Table is_reviewer={false} review_data={participant.reviews}
                                              key={'final-'+participant.id}
                                              receiver_id={participant.id} week_data={this.props.week_data}/>
                            })
                            :
                            reviewers.map(participant => {
                                const user = users[participant.id];
                                return (
                                    <Col key={participant.id} l={12} m={12} s={12}>
                                        <Person user={user} user_id={participant.id} review_data={participant}
                                                is_reviewer={false}
                                                week_data={week_data} my_id={this.props.my_id}/>
                                    </Col>
                                )
                            })
                        }
                    </Tab>
                    {!week_data._finished ?
                        <Tab title="Вы смотрите код этих людей" tabWidth={6}>
                            {
                                reviewed.map(participant => {
                                    const user = users[participant.id];
                                    return (
                                        <Col key={participant.id} l={12} m={12} s={12}>
                                            <Person user={user} user_id={participant.id} review_data={participant}
                                                    is_reviewer={true}
                                                    week_data={week_data} my_id={this.props.my_id}/>
                                        </Col>
                                    )
                                })
                            }
                        </Tab>
                        : ''
                    }
                </Tabs>
            </Row>
        )
    }
}

export default Evaluation