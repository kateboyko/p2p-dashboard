import React, {Component} from 'react'
import EvaluateModal from "./EvaluateModal";

class Table extends Component {
    render() {
        const is_reviewer = this.props.is_reviewer,
              reviews_data = this.props.review_data,
              week_data = this.props.week_data,
              review_number = this.props.review_number

        return (
            <table className="striped responsive-table">
                <thead>
                <tr>
                    <th className="mark-td">Задача</th>
                    <th className="mark-td">Оценка за первое ревью</th>
                    <th>Комментарий за первое ревью</th>
                    {review_number ? <th>Оценка за повторное ревью</th> : ''}
                    {review_number ? <th>Комментарий за повторное ревью</th> : ''}
                </tr>
                </thead>
                <tbody>
                {reviews_data[0].marks.map((mark, i) =>
                    <tr key={mark + i}>
                        <td className="mark-td">{i + 1}</td>
                        <td className={'mark-td' + (mark.mark < 3 ? 'red-text' : '')}>{mark.mark || '-'}</td>
                        <td className={(mark.mark < 3 ? 'red-text' : '') + ' truncate'}>
                            {
                                (is_reviewer) ? (mark.message ||
                                    <EvaluateModal week={week_data.info.number} mark_type="1"
                                                   trigger={<a href="#">оценить</a>}
                                                   task_number={i+1}
                                                   header={"Вы ставите оценку за задание " + (i + 1)}
                                                   action="setMark" receiver={this.props.receiver_id}
                                                   author_id={this.props.author_id}
                                    />
                                ) : (mark.message || '-')}
                        </td>
                        {review_number && reviews_data[review_number] ?
                            <td className={'mark-td' + (reviews_data[review_number].marks[i].mark < 3 ? 'red-text' : '')}>
                                {reviews_data[review_number].marks[i].mark || '-'}</td>
                            :''
                        }
                        {review_number && reviews_data[review_number]?
                            <td className={(reviews_data[review_number].marks[i].mark < 3 ? 'red-text' : '') + ' truncate'}>
                                {(is_reviewer) ?
                                    (reviews_data[review_number].marks[i].message ||
                                        <EvaluateModal week={week_data.info.number} mark_type="2"
                                                       task_number={i+1}
                                                       trigger={<a href="#">оценить</a>}
                                                       header={"Вы ставите оценку за задание " + (i + 1)}
                                                       action="setMark" receiver={this.props.receiver_id}
                                                       author_id={this.props.author_id}
                                        />
                                    ) :
                                    (reviews_data[review_number].marks[i].message || '-')
                                }
                            </td>
                            :''
                        }
                    </tr>
                )}

                </tbody>
            </table>
        )
    }
}

export default Table