import template from "@babel/template";
import {
    isModule,
    rewriteModuleStatementsAndPrepareHeader,
    isSideEffectImport,
    buildNamespaceInitStatements,
    ensureStatementsHoisted,
    wrapInterop,
} from "babel-helper-module-transforms";

const buildWrapper = template(`
  define(AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

function transformNEJDefine({ nejmUrl = './nejm.js', packages = [] }) {
    const nejModule = packages.map(packageName => {
        return new RegExp('\^(' + packageName + ')\/');
    });

    const textModule = /\.json$|\.html$|\.css$/;
    const nejm = /^nejm$/;

    return function (importName) {
        if (textModule.test(importName)) {
            importName = 'text!' + importName;
        } else {
            if (nejm.test(importName)) {
                importName = nejmUrl;
            }

            nejModule.forEach(m => {
                if (m.test(importName)) {
                    importName = importName.replace(m, '{$1}');
                }
            });

            if (!importName.endsWith('.js')) {
                importName += '.js';
            }
        }


        return importName;
    }
}

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit(path, { opts }) {
                    const _ = transformNEJDefine(opts);
                    if (!isModule(path)) return;

                    const {
                        meta,
                        headers,
                    } = rewriteModuleStatementsAndPrepareHeader(path, {
                            loose: false,
                            strict: false,
                            strictMode: false,
                            allowTopLevelThis: false,
                            noInterop: false
                        });

                    const amdArgs = [];
                    const importNames = [];

                    for (const [source, metadata] of meta.source) {
                        amdArgs.push(t.stringLiteral(_(source)));
                        importNames.push(t.identifier(metadata.name));

                        if (!isSideEffectImport(metadata)) {
                            const interop = wrapInterop(
                                path,
                                t.identifier(metadata.name),
                                metadata.interop,
                            );
                            if (interop) {
                                const header = t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.identifier(metadata.name),
                                        interop,
                                    ),
                                );
                                header.loc = metadata.loc;
                                headers.push(header);
                            }
                        }

                        headers.push(...buildNamespaceInitStatements(meta, metadata));
                    }

                    ensureStatementsHoisted(headers);
                    path.unshiftContainer("body", headers);

                    const { body, directives } = path.node;

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer("body", [
                        buildWrapper({
                            AMD_ARGUMENTS: t.arrayExpression(amdArgs),
                            IMPORT_NAMES: importNames,
                        }),
                    ]);

                    // 处理 return 数据
                    const amdWrapper = path.get("body")[0];
                    const amdFactory = amdWrapper
                        .get("expression.arguments")
                        .filter(arg => arg.isFunctionExpression())[0]
                        .get("body");

                    amdFactory.pushContainer("directives", t.VariableDeclaration('const', [t.VariableDeclarator(t.identifier('_export'), t.ObjectExpression([]))]));
                    amdFactory.pushContainer("directives", directives);
                    amdFactory.pushContainer("body", body);
                    amdFactory.pushContainer("body", t.returnStatement(t.identifier('_export')));
                },
            },
        },
    };
}
