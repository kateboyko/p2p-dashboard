import React, {Component} from 'react'
import {Button, Card, Col, Collapsible, CollapsibleItem, Input, Row} from "react-materialize";
import {refactorReviewData} from "../reviewMethods";
import axios from 'axios'

class Review extends Component {
    constructor() {
        super();
        this.state = {
            change_reviewer: false,
            make_warnings_for_users: []
        }
        this.handleSelect = this.handleSelect.bind(this)
        this.deleteReviewed = this.deleteReviewed.bind(this)
        this.sendJson = this.sendJson.bind(this)
    }

    componentDidMount() {
        axios.get("/review-planner?ajax=true")
        // axios.get("review.json")
        // .then(res => res.json())
            .then(res => {
                this.setState(refactorReviewData(res.data))
            })
    }

    handleSelect(e) {
        let assignment = e.target.dataset.assignment;
        let user = e.target.dataset.user;
        let i = e.target.value[0];
        let new_reviewer = parseInt(e.target.value.substring(2));
        let data = this.state;
        let user_obj = data.weeks[0].participants.find(u => parseInt(u.id) === parseInt(user));
        user_obj._was_changed = true;
        let new_reviewer_obj = data.weeks[0].participants.find(u => parseInt(u.id) === parseInt(new_reviewer));
        new_reviewer_obj._was_changed = true;
        if (new_reviewer) {
            data.weeks[0].reviewers[user][assignment][i] = new_reviewer
            this.setState(refactorReviewData(data))
        }
    }

    deleteReviewed(e) {
        let data = this.state;
        let reviewed = e.target.dataset.reviewed;
        let reviewer = e.target.dataset.reviewer;
        let reviewed_obj = data.weeks[0].participants.find(u => parseInt(u.id) === parseInt(reviewed));
        reviewed_obj._was_changed = true;
        let reviewer_obj = data.weeks[0].participants.find(u => parseInt(u.id) === parseInt(reviewer));
        reviewer_obj._was_changed = true;
        let assignment = e.target.dataset.assignment;
        data.weeks[0].reviewers[reviewed][assignment] = data.weeks[0].reviewers[reviewed][assignment].filter(u => u != reviewer);
        this.setState(refactorReviewData(data))
    }

    sendJson() {
        let weeks = this.state.weeks;
        weeks.forEach(week => week.participants.forEach(p => {
            p._assignments = [];
            p._reviews = []
        }))
        weeks = JSON.stringify({weeks: weeks}).replace(/(\d\d).(\d\d).(\d{4})/g, "$3-$1-$2");
        axios({
            method: 'post',
            url: 'save-review-snapshot',
            data: {
                _token: document.querySelector('meta[name=csrf-token]').content,
                new_snapshot_history: weeks,
                change_reviewer: this.state.change_reviewer,
                make_warnings_for_users: this.state.make_warnings_for_users
            }
        })
            .then(res => {
                console.log(res);
                alert('сохранено!');
            })
    }

    render() {
        const today = this.state.today
        let editable = false;
        if (today >= 3 && today <= 5)
            editable = true

        if (this.state.weeks)
            return (
                <Row>
                    <Row>
                        <h3>
                            <span
                                className="push-left">Определение ревьюверов на {this.state.weeks[0]._review_date}</span>
                        </h3>
                        <div>
                            <Button onClick={this.sendJson}>отправить</Button>
                            <Input type="checkbox" checked={this.state.change_reviewer}
                                   label="Замена ревьюера(отправить письма об изменении ревьюеров)" onChange={() => {
                                this.setState({change_reviewer: !this.state.change_reviewer});
                            }}/>
                        </div>

                    </Row>
                    {
                        this.state.weeks[0].participants.map(user =>
                            <Card className="grey lighten-3" key={user.id}>
                                <div>{user.name} {user.surname}, level {user.level}</div>
                                <br/>
                                <Row>
                                    <Col l={6} m={6} s={6}>
                                        {user.want_reviewers_for_assignments.length ?
                                            user.want_reviewers_for_assignments.map(review =>
                                                <div key={'week-' + review}
                                                     className={this.state.weeks[0].reviewers[user.id][review].length < this.state.weeks[0].default_reviewer_slots ? 'black-border' : ''}>
                                                    <div>ревьюверы на неделю {review}</div>
                                                    {
                                                        [...new Array(this.state.weeks[0].default_reviewer_slots).keys()].map(i => {
                                                            const reviewer_id = this.state.weeks[0].reviewers[user.id][review][i];
                                                            const reviewer = this.state.weeks[0].participants.find(u => u.id === reviewer_id) ||
                                                                {
                                                                    id: 0,
                                                                    level: 0,
                                                                    name: 'no',
                                                                    surname: 'reviewer'
                                                                }
                                                            reviewer._duplicate =
                                                                this.state.weeks[0].reviewers[user.id][review].indexOf(reviewer_id) !== -1 &&
                                                                this.state.weeks[0].reviewers[user.id][review].indexOf(reviewer_id) !== i;
                                                            return (
                                                                <Row key={user.id + ' ' + i}>
                                                                    <Input type="select" disabled={!editable}
                                                                           onChange={this.handleSelect}
                                                                           data-user={user.id}
                                                                           data-assignment={review}
                                                                           className={reviewer.level !== user.level ? 'blue' : reviewer.id === user.id ? 'red' : reviewer._duplicate ? 'orange' : ''}
                                                                    >
                                                                        {
                                                                            [
                                                                                reviewer,
                                                                                ...user._assignments[review]._potential_reviewers
                                                                                    .filter(p => p.id !== reviewer_id)
                                                                            ].map((pr, j) => {
                                                                                return (
                                                                                    <option
                                                                                        key={'reviewer-' + pr.id + '-' + user.id + '-' + j}
                                                                                        value={i + '-' + pr.id}
                                                                                    >
                                                                                        {pr.name} {pr.surname}
                                                                                        {pr.id ?
                                                                                            `, ${pr.level} level, ревьювал ${pr._did_review || '0'} раз, ревьювался ${pr._was_reviewed || '0'} раз
                                                                                            `
                                                                                            : ''}
                                                                                    </option>
                                                                                )
                                                                            })
                                                                        }
                                                                    </Input>
                                                                </Row>
                                                            )
                                                        })
                                                    }
                                                    <br/>
                                                </div>
                                            )
                                            : 'волонтёр'
                                        }
                                    </Col>
                                    <Col l={6} m={6} s={6}>
                                        <div>ревьювает этих людей:</div>
                                        {user._reviews &&
                                        Object.keys(user._reviews).map(assignment => {
                                            return user._reviews[assignment].map(reviewed => {
                                                return (
                                                    <div
                                                        key={reviewed.id + '-' + user.id + '-' + reviewed._assignment}
                                                        className={reviewed.level !== user.level ? 'blue' : reviewed.id === user.id ? 'red' : ''}
                                                    >
                                                        {reviewed.name} {reviewed.surname},
                                                        &nbsp;задание {reviewed._assignment}, {reviewed.level} level,
                                                        &nbsp;ревьювал {reviewed._did_review || '0'}
                                                        &nbsp;раз, ревьювался {reviewed._was_reviewed || '0'}
                                                        &nbsp;раз
                                                        <Button onClick={this.deleteReviewed}
                                                                data-reviewed={reviewed.id} data-reviewer={user.id}
                                                                data-assignment={assignment}>X</Button>
                                                    </div>
                                                )
                                            })
                                        })
                                        }
                                    </Col>
                                </Row>
                            </Card>
                        )
                    }

                    <Row>
                        <Collapsible>
                            <CollapsibleItem header='Выставить ворнинги'>
                                {
                                    this.state.weeks[0].participants
                                        .map(user => {
                                            return (
                                                <Row key={'warnings' + user.id}>
                                                    <Input
                                                        onChange={e => {
                                                            let arr = this.state.make_warnings_for_users;
                                                            this.setState({
                                                                    make_warnings_for_users: e.target.checked ?  [...arr, e.target.value] : arr.filter(v => v != e.target.value)
                                                                })
                                                        }}
                                                        type="checkbox" value={user.id} label={
                                                        <div className={user._was_changed ? 'yellow' : ''}>
                                                            {user.name} {user.surname}
                                                        </div>
                                                    }/>
                                                </Row>
                                            )
                                        })
                                }
                            </CollapsibleItem>
                        </Collapsible>
                    </Row>
                </Row>
            );
        else
            return (
                <h1>У нас ещё не было ни одного ревью, редактировать нечего.</h1>
            )
    }
}

export default Review