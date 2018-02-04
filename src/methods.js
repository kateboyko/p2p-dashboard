import $ from 'jquery';
import {
    A_MATERIALS_URL, B_MATERIALS_URL,
    DAYS_TO_DO_HOMEWORK, DEADLINE_TIME, FEEDBACK_FORM1_START_TIME, FEEDBACK_FORM2_START_TIME, HOMEWORKS_PATH,
    NOTIFICATION_CODE_EMPTY, NOTIFICATION_FIRST_MEETING, NOTIFICATION_FREEZED, NOTIFICATION_TG_EMPTY,
    NOTIFICATION_THEORY_MEETING, REDIRECT_URL,
    REVIEW_1_DURATION, REVIEW_2_DURATION
} from "./constants";



function getDeadlineDate(start_date, days_to_add, varname) {
    if(typeof start_date === "string")
        start_date = new Date(start_date + 'T00:00:00')
    start_date.setDate(start_date.getDate() + days_to_add)
    // console.log({[varname]: start_date});
    return start_date;
}

function niceDate(date) {
    const dd = ('0' + date.getDate()).slice(-2)
    const mm = ('0' + (date.getMonth() + 1)).slice(-2)
    const yyyy = date.getFullYear()
    return dd + "." + mm + "." + yyyy
}

function isDeadlined(start_date, days_to_add,  check_date) {
    return getDeadlineDate(new Date(start_date), days_to_add, 'is_deadlined') < check_date
}

function refactorHeader(text, lastHomework, review, user_id) {
    text = text.replace('SUBMISSION_DEADLINE_DATE_TIME', review._code_submit_deadline)
    text = text.replace('LINK_DOWNLOAD_LAST_SUBMISSION', "<a href='" + HOMEWORKS_PATH + user_id + '/' +lastHomework +"' download='"+lastHomework+"'>скачать последнюю версию</a>")
    text = text.replace('REVIEW_REGISTRATION_WEEKDAY_DATE', review._code_submit_deadline.substr(0, 10))
    return text
}

function refactorReviewData(week_data, number, global_data, vacation_countdown) {
     const my_date = new Date(global_data.now.today + 'T00:00:00'),
        extra_days = (number === 1) ? 0 : week_data.info._reviews_duration_days[0],
        start_date = getDeadlineDate(week_data.start_date, 1 + DAYS_TO_DO_HOMEWORK + extra_days, 'start_date'),
        code_accept_start_date    = number === 1 ? new Date(week_data.start_date+'T00:00:00') :  getDeadlineDate(week_data.start_date, DAYS_TO_DO_HOMEWORK+1, 'code_accept_satrt'),
        code_submit_deadline_date = new Date(start_date),
        code_submit_deadline      = niceDate(getDeadlineDate(new Date(code_submit_deadline_date), -1)) + " " + DEADLINE_TIME,
        accepting  = code_accept_start_date <= my_date && my_date < code_submit_deadline_date ? '_ACCEPTING' : '',
        submitted  = week_data.last_homeworks[number - 1] ? '_SUBMITTED' : '',
        regday     = number === 1 && Number(getDeadlineDate(new Date(code_submit_deadline_date), -1)) === Number(my_date) ? '_REGDAY' : '',
        registered = (number === 2 || week_data.review_registration.review_confirmed) ? '_REGISTERED' : '',
        review     =  start_date <= my_date && my_date < getDeadlineDate(new Date(start_date), week_data.info._reviews_duration_days[number-1], 'review deadline') ? '_REVIEW' : '',
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

function phpDate(date){
    if(date) {
        let y = date.split('.')[2]
        let d = date.split('.')[1]
        let m = date.split('.')[0]

        return [y, m, d].join('-')
    }
    return 0;
}

function refactorWeekData(week_data, global_data) {

    let today = new Date(global_data.now.today)

    week_data.start_date  = phpDate(week_data.start_date)
    week_data._started =  (new Date(week_data.start_date) <= today)

    week_data._warnings = global_data.user.warnings.length ? global_data.user.warnings.filter(warning => warning.week === week_data.info.number).length : 0

    week_data.info._reviews_duration_days = [REVIEW_1_DURATION, REVIEW_2_DURATION]

    week_data._reviews = [1,2].map((n) => refactorReviewData(week_data, n, global_data, global_data.now.vacation_countdown))

    week_data._reviews = week_data._reviews.map((review, i)=>{
        review._header = refactorHeader(global_data.headers_templates.review_header[review._status] || global_data.headers_templates.review_header['DEFAULT'], week_data.last_homeworks[i], review, global_data.user.id)
        return review
    })

    if(week_data._reviews[0]._regday)
        global_data.now._regday = true;

    week_data._finished = week_data._reviews[1] && week_data._reviews[1]._finished
    if(week_data._finished)
        week_data._avg_review_marks = week_data._reviews.map((_, i) => {
            let sum = 0
            if(week_data.reviewers && week_data.reviewers.length) {
                week_data.reviewers.map(reviewer => {
                    reviewer.reviews[i].marks.forEach(mark => {
                        sum += mark.mark
                    })
                })
                return Number((sum / (week_data.reviewers.length * week_data.info.tasks)).toFixed(2))
            }
            return 0
        })

    week_data.review_registration._opened = week_data._reviews[0]._regday
    week_data.review_registration._show_cancel_participation_button = week_data._reviews[0]._review // || week_data._reviews[1]._review

    const contacts_list_opened = week_data._reviews[0]._start_date.setHours(9) <= new Date(global_data.now.today + ' ' + global_data.now._time)
    week_data._contacts_list_arrival = {
        _date: week_data._reviews[0]._start_date,
        _opened: contacts_list_opened,
        time: '09:00:00'
    }
    if(Number(getDeadlineDate(new Date(week_data.start_date), 8)) === Number(today) ||
        global_data.now.current_week === 1 && Number(getDeadlineDate(new Date(week_data.start_date), 1)) === Number(today))
        global_data.now._monday_meetup = true;
    return week_data
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
    if(!data.weeks.length) return
    data.last_feedback = phpDate(data.last_feedback)
    const last_feedback_date = new Date(data.last_feedback + 'T23:59:59'),
          my_date = new Date(data.now.today + 'T' + data.now._time),
          week_start = data.weeks[data.user.current_week - 1].start_date,
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
    if(data.volunteer)
        visible = false;
    if(document.cookie.indexOf('hideFeedback') !== -1)
        visible = false;
    data._feedback_form = {
            _visible: visible,
            _week: data.user.current_week,
            _meetup: nearest_meetup,
            _date: niceDate(open_dates[nearest_meetup -1])
        }
        return data;
}

function refactorData(data) {
    console.log(data)

    data.now._time = new Date().toLocaleTimeString()
    data.now.today = phpDate(data.now.today)

    data.weeks = data.weeks.map((week, i) => refactorWeekData(week, data))

    if(!data.volunteer && +(data.now.vacation_countdown) !== 1) {
        data.now.notifications = data.now.notifications || []
        if (data.now._monday_meetup && +data.now.vacation_countdown !== 2)
            data.now.notifications.unshift({
                type: "info",
                message: data.user.current_week === 1 ? NOTIFICATION_FIRST_MEETING : NOTIFICATION_THEORY_MEETING.replace('THEORY_QUESTIONS_LINK', '<a href=' + (data.user.current_week - 1 < 7 ? A_MATERIALS_URL : B_MATERIALS_URL) + 'questions' + ((data.user.current_week - 1) < 10 ? '0' + (data.user.current_week - 1) : (data.user.current_week - 1)) + ' target="_blank" rel="noreferrer noopener">тут</a>')
            })
        if (data.now.freezed && data.now.week_day >= 3 && data.now.week_day <= 6)
            data.now.notifications.unshift({
                type: "warn",
                message: NOTIFICATION_FREEZED
            })
        if (data.now._regday)
            data.now.notifications.unshift({
                type: "info",
                message: NOTIFICATION_CODE_EMPTY
            })
        if(!(data.user.telegram && data.user.phone))
            data.now.notifications.unshift({
                type: "warn",
                message: NOTIFICATION_TG_EMPTY
            })
    }

    data.now._first_deadline = DAYS_TO_DO_HOMEWORK

    refactorVideos(data.videos)

    refactorFeedbacksForm(data)

    function isAtCurrentStage(week) {
        return data.user.current_week > 7 && data.weeks[7]._finished ? week > 7 : week < 8
    }

    data.user._warnings_amount = data.user.warnings.filter(w => isAtCurrentStage(w.week)).length

    if(data.volunteer)
        if(+(data.now.week_day) === 1 || +(data.now.week_day) === 2)
            data.volunteer._settings_compiled = Object.assign({_editable: true}, data.volunteer.future_review_registration)
        else
            data.volunteer._settings_compiled = Object.assign({
                _is_review: !!data.volunteer.ongoing_review_registration
            }, data.volunteer.ongoing_review_registration)

    if(!data.volunteer)
        data.user._vacation_period =
            '' + niceDate(getDeadlineDate(data.weeks[data.user.current_week-1].start_date, 14))
            + ' - ' + niceDate(getDeadlineDate(data.weeks[data.user.current_week-1].start_date, 21));

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
    [...document.querySelectorAll('#root a'), ...document.querySelectorAll('.modal a')]
        .forEach(link_elem => {
        if (link_is_external(link_elem))
            if(!link_elem.classList.contains('external_link')) {
                link_elem.classList.add('external_link')
                $(link_elem).prepend('&nbsp;<i class="fa fa-external-link" aria-hidden="true"></i>')
                let link = $(link_elem).attr('href')
                $(link_elem).attr('href', REDIRECT_URL + link)
             }
    });
}


export {getDeadlineDate, isDeadlined, niceDate, refactorData, refactorLinks}