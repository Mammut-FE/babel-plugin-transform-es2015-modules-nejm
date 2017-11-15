const babel = require('babel-core');
const {
    join
} = require('path');
const {
    writeFileSync
} = require('fs');

const alias = {
    'actions': 'pro/actions',
    'global': 'pro/global',
    'store': 'pro/store',
    'lib': 'pro/lib'
};

const options = {
    presets: [
        'env'
    ],
    plugins: [
        [join(__dirname, '../lib/index'), {
            alias,
            extName: '.es6'
        }]
    ]
};

let result;
if (process.argv.length > 2) { // run code
    const code = `
    import { util as _u, utilTemplateTpl as _t } from 'nejm';
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
    `;

    result = babel.transform(code, options);
} else {
    result = babel.transformFileSync(join(__dirname, 'nej-code.js'), options);
}

writeFileSync(join(__dirname, 'nej-code.out.js'), result.code);
