const NULL_ID = "00000000-0000-0000-0000-000000000000";

const MODES = {
    "none":     0,
    "default":  1,
    "loading":  2,
    "saving":   3,
    "success":  4,
    "search":   5,
    "error":    9
};

const MONTHS = {
    0: {name: 'январь'},
    1: {name: 'февраль'},
    2: {name: 'март'},
    3: {name: 'апрель'},
    4: {name: 'май'},
    5: {name: 'июнь'},
    6: {name: 'июль'},
    7: {name: 'август'},
    8: {name: 'сентябрь'},
    9: {name: 'октябрь'},
    10:{name: 'ноябрь'},
    11:{name: 'декабрь'}
};

const empty = val => {
    if (!!val){
        return /^$/.test(val);
    }
    return true;
};

const phpdate2m = s => {
    return empty(s) ? null : $moment(s, 'YYYY-MM-DD HH:mm:ss');
};

export {
    NULL_ID,
    MODES,
    MONTHS,
    empty,
    phpdate2m
}