import React, {Component} from 'react'
import Person from "./Person";
import {Collapsible, Row} from "react-materialize";
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
                {!this.props.volunteer && reviewers && reviewers.length ?
                    <div>
                        <strong className="review__header">Ваш код смотрят:</strong>
                        {week_data._finished ?
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
                            ) :
                            reviewers.map(participant => {
                                const user = users[participant.id];
                                return (
                                    <Collapsible key={participant.id} className="review__content">
                                        <Person _review={this.props.week_data._reviews[review_index]} user={user}
                                                user_id={participant.id} review_data={participant}
                                                is_reviewer={false}
                                                week_data={week_data} my_id={this.props.my_id}/>
                                    </Collapsible>
                                )
                            })
                        }
                    </div> :''
                }
                {!week_data._finished && reviewed && reviewed.length ?
                    <div>
                        <strong className="review__header">Вы смотрите код этих людей:</strong>
                        {!week_data._finished ?
                            reviewed.map(participant => {
                                const user = users[participant.id];
                                return (
                                    <Collapsible key={participant.id} className="review__content">
                                        <Person _review={this.props.week_data._reviews[review_index]} user={user}
                                                user_id={participant.id} review_data={participant}
                                                is_reviewer={true}
                                                week_data={week_data} my_id={this.props.my_id}/>
                                    </Collapsible>
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