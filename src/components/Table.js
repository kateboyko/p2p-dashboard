import React, {Component} from 'react'
import EvaluateModal from "./EvaluateModal";

class Table extends Component {
    render() {
        const is_reviewer = this.props.is_reviewer,
              reviews_data = this.props.review_data,
              week_data = this.props.week_data
        return (
            <table className="striped responsive-table">
                <thead>
                <tr>
                    <th>Задача</th>
                    <th>Оценка</th>
                    <th>Комментарий</th>
                    {reviews_data.length > 1 && <th>Оценка</th>}
                    {reviews_data.length > 1 && <th>Комментарий</th>}
                </tr>
                </thead>
                <tbody>
                {reviews_data[0].marks.map((mark, i) =>
                    <tr key={mark + i}>
                        <td>{i + 1}</td>
                        <td className={mark.mark < 3 ? 'red-text' : ''}>{mark.mark || '-'}</td>
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
                        {reviews_data.length > 1 &&
                            <td className={reviews_data[1].marks[i].mark < 3 ? 'red-text' : ''}>
                                {reviews_data[1].marks[i].mark || '-'}</td>
                        }
                        {reviews_data.length > 1 &&
                            <td className={(reviews_data[1].marks[i].mark < 3 ? 'red-text' : '') + ' truncate'}>
                                {(is_reviewer) ?
                                    (reviews_data[1].marks[i].message ||
                                        <EvaluateModal week={week_data.info.number} mark_type="2"
                                                       task_number={i+1}
                                                       trigger={<a href="#">оценить</a>}
                                                       header={"Вы ставите оценку за задание " + (i + 1)}
                                                       action="setMark" receiver={this.props.receiver_id}/>
                                    ) :
                                    (reviews_data[1].marks[i].message || '-')
                                }
                            </td>
                        }
                    </tr>
                )}

                </tbody>
            </table>
        )
    }
}

export default Table