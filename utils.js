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

const date2php = (d, timed = false) => {
    return (d === null) ? null : $moment(d).format(timed ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
};

const _formatter = new Intl.NumberFormat("ru-RU", {minimumFractionDigits: 2}),
      currformat = n => {
            if ( n ){
                var n = Number(n);
                return Number.isNaN(n) ? '' : _formatter.format(n);
            }
            return '';
};

    

export {
    NULL_ID,
    MODES,
    MONTHS,
    empty,
    date2php,
    phpdate2m,
    currformat
}