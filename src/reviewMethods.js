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
    });
    return counter
}

function crossReview(reviewer, reviewed, reviewers, assignment) {
    return reviewers[reviewer] && reviewers[reviewer][assignment] && reviewers[reviewer][assignment].indexOf(reviewed) !== -1 &&
           reviewers[reviewed] && reviewers[reviewed][assignment] && reviewers[reviewed][assignment].indexOf(reviewer) !== -1
}

function generateRandomReviewers(data){
    function shuffle (a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    let w = data.weeks[0];
    let pids = w.participants.map(p => p.id);
    let pids3 = [];
    for (let i = 0; i < w.default_reviewer_slots; i++)
        pids3 = pids3.concat(pids);
    shuffle(pids3);
    Object.keys(w.reviewers).forEach(rid => {
        let allass = w.reviewers[rid];
        Object.keys(allass).forEach(rrid => {
            allass[rrid] = pids3.slice(0, w.default_reviewer_slots);
            pids3.splice(0, w.default_reviewer_slots);
        })
    });

    return data;
}

function planReview(data) {
    data = JSON.parse(JSON.stringify(data));
    return generateRandomReviewers(data);
}

function refactorReviewData(data) {
    console.log(data);
    if(!data || !data.weeks)
        return;
    data.weeks.forEach(week => {
        week._review_date = niceDate(getDeadlineDate(new Date(week.monday), DAYS_TO_DO_HOMEWORK));
        week.participants.forEach(user => {
            if(user.want_reviewers_for_assignments && !user.want_reviewers_for_assignments.length)
                user._volunteer = true
        })
        week.participants.forEach(user=> {
            user._assignments = {};
            user._was_changed = !!user._was_changed;
            user.want_reviewers_for_assignments.forEach(assignment => {
                user._assignments[assignment] = {};
                user._assignments[assignment]._potential_reviewers =
                    week.participants
                        .filter(p => p._volunteer ? true : !(p.id === user.id || p.level < user.level))
                        .sort((a, b) => (a.level === user.level) ? false : a.level < b.level)
                        .map(pr => {
                            let potential_reviewer = Object.assign({}, week.participants.find(u => parseInt(u.id) === parseInt(pr.id)));
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
                            let reviewed_user = Object.assign({}, week.participants.find(u => parseInt(u.id) === parseInt(reviewed)));
                            reviewed_user._assignment = assignment;
                            reviewed_user._did_review = didReview(user.id, reviewed_user.id, data.weeks);
                            reviewed_user._was_reviewed = didReview(reviewed_user.id, user.id, data.weeks);
                            acc[assignment] = acc[assignment] || [];
                            acc[assignment].push(reviewed_user)
                        })
                        return acc;
                    }, {});


        });
    });
    console.log(data);
    return data;
}

function clearObject(obj){
    if(!(obj && typeof obj === 'object'))
        return '';
    let obj_keys = Object.keys(obj)
    if(!(obj_keys && obj_keys.length))
        return '';
    obj_keys.forEach(key =>{
            if(key[0] === '_')
                delete obj[key];
            obj[key] = clearObject(obj[key])
        })
    return obj;
}

export {refactorReviewData, clearObject, didReview, crossReview, planReview}