import React, {Component} from 'react'
import {A_MATERIALS_URL, B_MATERIALS_URL} from "../constants";
import Lecture from "./Lecture";
import ReviewInfo from "./ReviewInfo";
import Evaluation from "./Evaluation";

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
                <div className="review__header">
                    <strong>Материалы:&nbsp;</strong>
                    <span>
                    <a target="_blank" rel="noopener noreferrer" href={(week_index > 6 ? B_MATERIALS_URL : A_MATERIALS_URL) + 'assignment' + data.info.number}>
                        Задание {data.info.number} &mdash; {data.info.title}</a>
                    </span>

                    <span>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <a target="_blank" rel="noopener noreferrer" href={(week_index > 6 ? B_MATERIALS_URL : A_MATERIALS_URL) + 'questions' + (data.info.number < 10 ? "0" + data.info.number : data.info.number)}>
                            вопросы на встречу</a>
                    </span>
                    {week_index < 7  ?
                        <span>
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                                <a target="_blank" rel="noopener noreferrer"
                                   href={A_MATERIALS_URL + 'shandout' + (data.info.number < 10 ? "0" + data.info.number : data.info.number)}>
                                секционные материалы</a> +
                            <a target="_blank" rel="noopener noreferrer"
                               href={A_MATERIALS_URL + 'shandout-solutions' + (data.info.number < 10 ? "0" + data.info.number : data.info.number)}> решения</a>
                        </span> : null
                    }

                </div>
                <br/>
                {lectures && lectures.length ? lectures.map((lecture, i) =>
                    <div key={'lecture' + i}>
                        <Lecture lecture={lecture} lecture_index={i} week_index={week_index} videos={videos.parts[i]}/>
                    </div>
                ) : ''}
                <hr/>
                {!this.props.volunteer ?
                    data._reviews.map((review, i) =>
                            <ReviewInfo number={i + 1} week_data={data} now={now} key={'review' + i}
                                        header_templates={header_templates.review_header}
                                        data={review} my_id={me.id}/>
                    ) : ''
                }

                {data._contacts_list_arrival._opened ?
                    <div>
                        <Evaluation reviewers={data.reviewers} reviewed={data.reviewed} week_data={data} users={users}
                                    my_id={me.id}
                                    volunteer={this.props.volunteer}
                        />
                    </div>
                    : parseInt(now.week_day) === 3  &&
                        data.review_registration && data.review_registration.review_confirmed
                        ?  <div>Ждите появления контактов в 9:00</div> : ''
                }
            </div>
        )
    }
}

export default Week