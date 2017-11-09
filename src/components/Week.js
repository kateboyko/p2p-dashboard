import React, {Component} from 'react'
import {MATERIALS_URL} from "../constants";
import Lecture from "./Lecture";
import ReviewInfo from "./ReviewInfo";
import Evaluation from "./Evaluation";
import Dashboard from "./Dashboard";
import {Button} from "react-materialize";

class Week extends Component {
    render() {
        const data = this.props.data,
            week_index = this.props.week_index,
            lectures = this.props.lectures,
            now = this.props.now,
            users = this.props.users,
            header_templates = this.props.header_templates,
            videos = this.props.videos,
            me = this.props.me
        return (
            <div id={data.id} key={data.id}>
                <div><strong>Материалы:&nbsp;</strong>
                    <a target="_blank" rel="noopener noreferrer" href={MATERIALS_URL + 'assignment' + data.info.number}>
                        Задание {data.info.number} &mdash; {data.info.title}</a>,
                    <a target="_blank" rel="noopener noreferrer" href={MATERIALS_URL + 'questions0' + data.info.number}>
                        вопросы на
                        встречу</a>,
                    <a target="_blank" rel="noopener noreferrer" href={MATERIALS_URL + 'shandout0' + data.info.number}>
                        секционные
                        материалы</a> +
                    <a target="_blank" rel="noopener noreferrer"
                       href={MATERIALS_URL + 'shandout-solutions0' + data.info.number}> решения</a>
                </div>
                <br/>
                {lectures.map((lecture, i) =>
                    <div key={'lecture' + i}>
                        <Lecture lecture={lecture} lecture_index={i} week_index={week_index} videos={videos.parts[i]}/>
                    </div>
                )}
                <hr/>
                {!this.props.volunteer ?
                    data._reviews.map((review, i) =>
                        <div key={'review' + i}>
                            <ReviewInfo number={i + 1} week_data={data} now={now}
                                        header_templates={header_templates.review_header}
                                        data={review} my_id={me.id}/>

                        </div>
                    ) : ''
                }
                <hr/>
                {data._contacts_list_arrival._opened &&
                <div>
                    <Evaluation reviewers={data.reviewers} reviewed={data.reviewed} week_data={data} users={users}
                                my_id={me.id}
                                volunteer={this.props.volunteer}
                    />
                </div>
                }
            </div>
        )
    }
}

export default Week