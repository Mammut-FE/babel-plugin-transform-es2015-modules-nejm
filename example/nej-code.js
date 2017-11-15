import {
    util as _u,
    utilTemplateTpl as _t
} from 'nejm';
import * as _tpl from './accordion.html';
import * as _css from './accordion.css';

_t._$parseUITemplate('<textarea name="css" id="css-box">' + _css + '</textarea>');

var dom = Regular.dom;

var tempMenuList = [{
    title: '',
    body: '',
    active: false
}, {
    title: '',
    body: '',
    active: false
}, {
    title: '',
    body: '',
    active: false
}, {
    title: '',
    body: '',
    active: false
}];

var Accordion = Regular.extend({
    name: 'accordion',
    template: _tpl,
    config: function (data) {
        this.data = _u._$merge({
            claszz: '',
            menuList: []
        }, data);
    },
    init: function () {}
});

export default Accordion;
