import $ from 'jquery';
import {
    DAYS_TO_DO_HOMEWORK, DEADLINE_TIME, FEEDBACK_FORM1_START_TIME, FEEDBACK_FORM2_START_TIME, HOMEWORKS_PATH,
    MATERIALS_URL,
    NOTIFICATION_FIRST_MEETING, NOTIFICATION_FREEZED,
    NOTIFICATION_THEORY_MEETING, REDIRECT_URL,
    REVIEW_1_DURATION,
    REVIEW_2_DURATION
} from "./constants";

function getDeadlineDate(start_date, days_to_add) {
    start_date = new Date(start_date)
    start_date.setDate(start_date.getDate() + days_to_add)
    return start_date;
}

function niceDate(date) {
    const dd = ('0' + date.getDate()).slice(-2)
    const mm = ('0' + (date.getMonth() + 1)).slice(-2)
    const yyyy = date.getFullYear()
    return dd + "." + mm + "." + yyyy
}

function togglePreview(e) {
    document.getElementById('#preview-' + e.target.dataset.id).classList.toggle('hidden')
}

function isDeadlined(start_date, days_to_add,  check_date) {
    return getDeadlineDate(start_date, days_to_add) < check_date
}

function refactorHeader(text, lastHomework, review, user_id) {
    text = text.replace('SUBMISSION_DEADLINE_DATE_TIME', review._code_submit_deadline)
    text = text.replace('LINK_DOWNLOAD_LAST_SUBMISSION', "<a href='" + HOMEWORKS_PATH + user_id + '/' +lastHomework +"' download='"+lastHomework+"'>скачать последнюю версию</a>")
    text = text.replace('REVIEW_REGISTRATION_WEEKDAY_DATE', review._code_submit_deadline.substr(0, 10))
    return text
}

function refactorReviewData(week_data, number, global_data) {
     const my_date = new Date(global_data.now.today), //new Date()
        extra_days = (number === 1) ? 0 : week_data.info._reviews_duration_days[0] - 1,
        start_date = getDeadlineDate(week_data.start_date, 1 + DAYS_TO_DO_HOMEWORK + extra_days),
        code_accept_start_date    = number === 1 ? new Date(week_data.start_date) :  getDeadlineDate(week_data.start_date, DAYS_TO_DO_HOMEWORK+1),
        code_submit_deadline_date = getDeadlineDate(start_date, -1),
        code_submit_deadline      = niceDate(code_submit_deadline_date) + " " + DEADLINE_TIME,
        accepting  = code_accept_start_date <= my_date && my_date < start_date ? '_ACCEPTING' : '',
        submitted  = week_data.last_homeworks[number - 1] ? '_SUBMITTED' : '',
        regday     = number === 1 && code_submit_deadline_date.toDateString() === my_date.toDateString() ? '_REGDAY' : '',
        registered = (number === 2 || week_data.review_registration.review_confirmed) ? '_REGISTERED' : '',
        review     =  start_date <= my_date && my_date < getDeadlineDate(start_date, week_data.info._reviews_duration_days[number-1]) ? '_REVIEW' : '',
        finished   = isDeadlined(start_date, week_data.info._reviews_duration_days[number-1]-1, my_date) ? '_FINISHED' : '',
        pending    = '_PENDING',
        status = (accepting || review) ? number + accepting + submitted + regday + registered + review : (finished ? number +  submitted + finished : number + pending)
    return {
        _start_date: start_date,
        _code_submit_deadline: code_submit_deadline,
        _status: status,
        _accepting: !!accepting,
        _number: number,
        _registered: !!registered,
        _regday: !!regday,
        _code_was_uploaded: !!submitted,
        _review: !!review,
        _finished: !!finished
    }
}

function refactorWeekData(week_data, global_data) {
    let today = new Date(global_data.now.today)

    // let today = new Date()

    week_data._started =  new Date(week_data.start_date) <= today

    week_data._warnings = global_data.user.warnings.length ? global_data.user.warnings.filter(warning => warning.week === "week" + week_data.info.number).length : 0

    week_data.info._reviews_duration_days = [REVIEW_1_DURATION, REVIEW_2_DURATION]

    week_data._reviews = [1,2].map((n) => refactorReviewData(week_data, n, global_data))

    week_data._reviews = week_data._reviews.map((review, i)=>{
        review._header = refactorHeader(global_data.headers_templates.review_header[review._status] || global_data.headers_templates.review_header['DEFAULT'], week_data.last_homeworks[i], review, global_data.user.id)
        return review
    })

    week_data._finished = week_data._reviews[1] && week_data._reviews[1]._finished
    if(week_data._finished)
        week_data._avg_review_marks = week_data._reviews.map((_, i) => {
            let sum = 0
            week_data.reviewers.map(reviewer => {
                reviewer.reviews[i].marks.forEach(mark => {
                    sum += mark.mark
                })
            })
            return Number((sum / (week_data.reviewers.length * week_data.info.tasks)).toFixed(1))
        })

    week_data.review_registration._opened = week_data._reviews[0]._regday
    week_data.review_registration._show_cancel_participation_button = week_data._reviews[0]._review || week_data._reviews[1]._review

    const contacts_list_opened = week_data._reviews[0]._start_date.setHours(9) <= new Date(global_data.now.today + ' ' + global_data.now._time)
    week_data._contacts_list_arrival = {
        _date: week_data._reviews[0]._start_date,
        _opened: contacts_list_opened,
        time: '09:00:00'
    }
    return week_data
}

function userAverageMark(data){
    let total_grades = 0
    let grades_amount = 0
    data.weeks.forEach(week => {
        if(week._finished)
            week._avg_review_marks.forEach(mark => {total_grades += mark; grades_amount++;})
    })
    return Number(total_grades/grades_amount).toFixed(1)
}

function refactorVideos(videos) {
    videos.weeks.map(week => {
        week.parts.map(part => {
            part.files.map(file => {
                file.filename = file.path.split('/')[1]
                file.directory = file.path.split('/')[0]
            })
        })
    })
}

function mySetTime(date_to_set, time_to_set) {
    date_to_set.setHours(time_to_set.split(':')[0])
    date_to_set.setMinutes(time_to_set.split(':')[1])
    date_to_set.setSeconds(time_to_set.split(':')[2])
    return date_to_set
}

function refactorFeedbacksForm(data) {
    const last_feedback_date = new Date(data.last_feedback + ' 23:59:59'),
          my_date = new Date(data.now.today + ' ' + data.now._time),
          week_start = data.weeks[data.user.current_week - 1].start_date,
          // extra_days = data.user.current_week === 1 ? 0 : 7,
          open_dates = [
              mySetTime(getDeadlineDate(week_start, 1), FEEDBACK_FORM1_START_TIME),
              mySetTime(getDeadlineDate(week_start, (data.user.current_week === 1 ? 7 : 0) + REVIEW_2_DURATION), FEEDBACK_FORM2_START_TIME)
          ],
          close_dates  = [
              mySetTime(getDeadlineDate(week_start, 1 + 1), DEADLINE_TIME),
              mySetTime(getDeadlineDate(week_start, (data.user.current_week === 1 ? 7 : 0) + REVIEW_2_DURATION + 1), DEADLINE_TIME)
          ],
          nearest_meetup = (data.now.week_day >= 3 && data.now.week_day <= 7) ? 2 : 1

    let visible = (open_dates[nearest_meetup-1].getTime() <= my_date.getTime() &&
                    my_date <= close_dates[nearest_meetup-1].getTime())

    if (open_dates[nearest_meetup-1].getTime() <= last_feedback_date.getTime() &&
        last_feedback_date.getTime() <= close_dates[nearest_meetup-1].getTime())
        visible = false;

    data._feedback_form = {
            _visible: visible,
            _week: data.user.current_week,
            _meetup: nearest_meetup,
            _week_day: nearest_meetup,
            _date: niceDate(open_dates[nearest_meetup -1])
        }
        return data;
}

function refactorData(data) {
    // data.now.today = new Date().toISOString().slice(0,10)
    console.log(data)
    // data.now.week_day = (new Date(data.now.today).getDay() + 1)

    // data.now._time = new Date().toLocaleTimeString()

    data.now.notifications = data.now.notifications || []
    if(parseInt(data.now.week_day) === 1 )
        data.now.notifications.unshift({
            type: "info",
            message: data.user.current_week === 1 ? NOTIFICATION_FIRST_MEETING : NOTIFICATION_THEORY_MEETING.replace('THEORY_QUESTIONS_LINK', '<a href=' + MATERIALS_URL + 'questions0' + (data.user.current_week-1) + ' target="_blank" rel="noreferrer noopener">тут</a>')
        })
    if(data.now.freezed)
        data.now.notifications.unshift({
            type: "warn",
            message: NOTIFICATION_FREEZED
        })
    if(parseInt(data.now.week_day) === 2 && data.user.current_week > 1 )
        data.now.notifications.unshift({
            type: "info",
            message: 'Залейте код сегодня и/или подтвердите участие в ревью, если вы до сих пор этого не сделали (проскролльте вниз и поставьте галочку).'
        })


    data.now._first_deadline = DAYS_TO_DO_HOMEWORK

    data.weeks = data.weeks.map((week, i) => refactorWeekData(week, data))

    data.user._average_grade = data.weeks.length > 2 ? userAverageMark(data) : 0

    refactorVideos(data.videos)

    refactorFeedbacksForm(data)

    console.log(data)
    return data
}

function link_is_external(link_element) {
    return (link_element.host !== window.location.host)
       && !($(link_element).prop("protocol").indexOf("mailto") === 0
         || $(link_element).prop("protocol").indexOf("tel") === 0
         || $(link_element).prop("protocol").indexOf("tg") === 0);

}
function refactorLinks() {
    document.querySelectorAll('#root a').forEach(link_elem => {
        if (link_is_external(link_elem)) {
            $(link_elem).prepend('&nbsp;<i class="fa fa-external-link" aria-hidden="true"></i>')
            let link = $(link_elem).attr('href')
            $(link_elem).attr('href', REDIRECT_URL + link)
        }
    });
}


export {togglePreview, getDeadlineDate, isDeadlined, niceDate, refactorData, refactorLinks}