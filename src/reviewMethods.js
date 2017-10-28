import {getDeadlineDate, niceDate} from "./methods";
import {DAYS_TO_DO_HOMEWORK} from "./constants";


function didReview(id, id2, weeks) {
    let counter = 0;
    weeks.forEach( (week, i) =>{
        if(i === 0)
            return;
        if(week.reviewers[id])
            Object.keys(week.reviewers[id])
                .forEach(key => {
                    if (week.reviewers[id][key].indexOf(id2) !== -1)
                        counter++;
                    })
    })
    return counter
}

function refactorReviewData(data) {
    console.log(data);
    if(!data || !data.weeks)
        return;
    data.weeks.forEach(week => {
        week._review_date = niceDate(getDeadlineDate(week.monday, DAYS_TO_DO_HOMEWORK));
        week.participants.forEach(user=> {
            user._assignments = {};
            user.want_reviewers_for_assignments.forEach(assignment => {
                user._assignments[assignment] = {};
                user._assignments[assignment]._potential_reviewers =
                    week.participants
                        .filter(participant => !(participant.id === user.id || participant.level < user.level))
                        .sort((a, b) => (a.level === user.level) ? false : a.level < b.level)
                        .map(pr => {
                            let potential_reviewer = Object.assign({}, week.participants.find(u => u.id == pr.id));
                            potential_reviewer._did_review = didReview(user.id, potential_reviewer.id, data.weeks);
                            potential_reviewer._was_reviewed = didReview(potential_reviewer.id, user.id, data.weeks);
                            return potential_reviewer;
                        })
            });
            user._reviews =
                Object.keys(week.reviewers || {})
                    .reduce( (acc, reviewed) => {
                        let assignments = Object.keys(week.reviewers[reviewed]).filter(assignment => {
                            return week.reviewers[reviewed][assignment].find(u_id => u_id === user.id);
                        })
                        assignments.forEach(assignment => {
                            let reviewed_user = Object.assign({}, week.participants.find(u => u.id == reviewed));
                            reviewed_user._assignment = assignment;
                            reviewed_user._did_review = didReview(user.id, reviewed_user.id, data.weeks);
                            reviewed_user._was_reviewed = didReview(reviewed_user.id, user.id, data.weeks);
                            acc[assignment] = acc[assignment] || []
                            acc[assignment].push(reviewed_user)
                        })
                        return acc;
                    }, {});

            // Object.keys(week.reviewers[user.id] || {})
                //     .reduce((accumulator, assignment) => {
                //         let reviewed = week.reviewers[user.id][assignment]
                //             .map(user_id => {
                //                 let reviewed_user = Object.assign({}, week.participants.find(u => u.id === user_id));
                //                 reviewed_user._assignment = assignment;
                //                 reviewed_user._did_review = didReview(user.id, reviewed_user.id, data.weeks);
                //                 reviewed_user._was_reviewed = didReview(reviewed_user.id, user.id, data.weeks);
                //                 return reviewed_user
                //             })
                //         return accumulator.concat(reviewed)
                //     }, [])
        });
    });
    console.log(data);
    return data;
}
export {refactorReviewData}