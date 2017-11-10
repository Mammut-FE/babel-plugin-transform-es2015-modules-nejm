import * as types from '@babel/types';
import { NodePath } from 'babel-traverse';
import { Program, ImportDeclaration, ImportNamespaceSpecifier, ImportSpecifier, ImportDefaultSpecifier } from 'babel-types';
import { name2source } from 'nejm/nejmap';

export { isModule } from 'babel-helper-module-transforms';
export { NodePath, Program };

interface NEJDefine {
    source: string;
    name?: string;
}

export interface NEJModules {
    amdArguments: string[];
    importNames: string[];
    fnBody: any[];
    returnStatement: any;
}

const TEXT_MODULR_RE = /\.html$|\.css$|\.json$/;
enum MODULE_TYPE {
    nej,
    text,
    custorm
}

// FIXME: 后期传入配置项
const exetName = /\.es6$/;
const alias = {
    'actions': 'pro/actions',
    'global': 'pro/global',
    'store': 'pro/store',
    'lib': 'pro/lib'
};

// FIXME: 后期删掉
const show = (arr: any[]) => {
    arr.forEach(a => {
        console.log(a);
    });
};

const genAliasRe = (alias: { [key: string]: string }): RegExp => {
    const excape = /(\/|{|})/g;
    const reStr = [];

    for (const key in alias) {
        reStr.push(`^${key.replace(excape, '\\' + '$1')}`);
    }

    return new RegExp(reStr.join('|'));
};



const transformImports = (importList: ImportDeclaration[], aliasRe: RegExp): NEJDefine[] => {
    const _transform = (source: string, specifiers: any[], type: MODULE_TYPE): NEJDefine[] => {
        const result: NEJDefine[] = [];

        switch (type) {
            case MODULE_TYPE.nej:
                specifiers.forEach((specifier) => {
                    result.push({
                        source: name2source[(specifier as ImportSpecifier).imported.name],
                        name: (specifier as ImportSpecifier).local.name
                    })
                });

                break;
            case MODULE_TYPE.text:
                specifiers.forEach((specifier) => {
                    if (source.endsWith('.json')) {
                        source = 'json!' + source;
                    } else {
                        source = 'text!' + source;
                    }

                    result.push({
                        source,
                        name: (specifier as ImportNamespaceSpecifier).local.name
                    })
                });

                break;
            case MODULE_TYPE.custorm:
                if (!specifiers.length) { // 处理单纯的 import 语句
                    specifiers.push(null);
                }

                specifiers.forEach((specifier) => {
                    // 处理自定义的后缀名
                    source = source.replace(exetName, '');

                    // 处理 alias
                    let _result = source.match(aliasRe);
                    if (_result) {
                        source = source.replace(_result[0], alias[_result[0]]);
                    }

                    // 相对路径添加 .js 尾缀
                    if (source.startsWith('.') && !source.endsWith('.js')) {
                        source += '.js';
                    }

                    result.push({
                        source,
                        name: specifier ? (specifier as ImportDefaultSpecifier).local.name : null
                    })
                });

                break;
        }

        return result;
    };
    let result: NEJDefine[] = [];

    importList.forEach(impd => {
        const { source, specifiers } = impd;
        let sourceName = source.value;
        let defines: NEJDefine[];

        if (sourceName === 'nejm') {
            defines = _transform(sourceName, specifiers, MODULE_TYPE.nej);
        } else if (TEXT_MODULR_RE.test(sourceName)) {
            defines = _transform(sourceName, specifiers, MODULE_TYPE.text);
        } else {
            defines = _transform(sourceName, specifiers, MODULE_TYPE.custorm);
        }

        result = result.concat(defines);
    });

    return result;
};

export const helper = (path: NodePath) => {
    const { node } = path;
    const importList = [];
    const amdArguments = [];
    const importNames = [];
    const aliasRe = genAliasRe(alias);

    const fnBody = [];
    const exportList = [];

    (node as Program).body.forEach(statement => {
        if (types.isImportDeclaration(statement)) { // 转换 import 为 define([], function(){});
            importList.push(statement);
        } else if (types.isExportDefaultDeclaration(statement) || types.isExportDefaultSpecifier(statement)) {
            // TODO: 添加所有的 export 类型, 暂时只支持 export default
            exportList.push(statement);
        } else {
            fnBody.push(statement);
        }
    });

    transformImports(importList, aliasRe);


    return {
        // importList,
        fnBody,
        exportList
    }
};
