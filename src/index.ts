import * as template from 'babel-template';

import { fetchImportAndFnbody } from 'babel-helper-nej-transforms';
import { Program, ExportDefaultDeclaration } from 'babel-types';

const buildWrapper = template(`
  define(AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit(path, { opts }) {
                    const { nejDefines, fnBody, exportDeclaration } = fetchImportAndFnbody(path, opts);

                    const amdArgs = [];
                    const importNames = [];

                    nejDefines.forEach(({ source, name }) => {
                        amdArgs.push(t.stringLiteral(source));
                        name && importNames.push(t.identifier(name));
                    });

                    if (exportDeclaration) {
                        fnBody.push(t.returnStatement((exportDeclaration as ExportDefaultDeclaration).declaration));
                    }

                    const { body, directives } = <Program>path.node;

                    (path.node as Program).directives = [];
                    (path.node as Program).body = [];

                    path.pushContainer('body', [buildWrapper({
                        AMD_ARGUMENTS: t.arrayExpression(amdArgs),
                        IMPORT_NAMES: importNames
                    })]);

                    // 处理 return 数据
                    const amdWrapper = path.get('body')[0];
                    const amdFactory = amdWrapper
                        .get('expression.arguments')
                        .filter(arg => arg.isFunctionExpression())[0]
                        .get('body');

                    amdFactory.pushContainer('directives', directives);
                    amdFactory.pushContainer('body', fnBody);
                }
            }
        }
    };
}


