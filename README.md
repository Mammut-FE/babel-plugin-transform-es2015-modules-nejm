# babel-plugin-transform-es2015-modules-nejm

将ES6转换成NEJ的babel插件

> 该插件需要同 [nejm](https://github.com/Mammut-FE/nejm) 配合使用
>
> 还可以使用 [babel-plugin-transform-nej-modules-es2015](https://github.com/Mammut-FE/babel-plugin-transform-nej-modules-es2015) 自动将NEJ代码转换成ES6



## 安装

```
npm i babel-plugin-transform-es2015-modules-nejm --save-dev

// 还需要根据需要安装对应的ES版本
npm i babel-preset-env --save-dev
```



## 使用

1. 编写`.babelrc`文件

   ```json
   {
      "plugins": ["transform-es2015-modules-nejm"],
      "presets": ['env']
   }
   ```

2. 可选配置项

   ```typescript
   export interface Options {
       /**
        * 为了能够将源码存放在现有的项目文件夹, 同时又需要使用 .js 后缀而做的妥协
        * @example
        * extName: '.es6'
        * inFileName: store.es6.js
        * outFileName: store.js
        */
       extName?: string;
       /**
        * 处理nej的自定义路径, 转换成 es6 的模块管理
        * 
        * @example
        * alias = {
        *     'lib': 'pro/lib',
        * }
        * 
        * lib/redux/redux         ==> pro/lib/redux/redux
        */
       alias?: { [key: string]: string };
   }
   ```



## 转换规则

1. NEJ的内置模块

   > 开发时使用 NEJM 代替 NEJ

   ```javascript
   // ES6 code
   import {
       klass as _k,
       element as _e,
       event as _v
   } from 'nejm';

   // NEJ code
   define([
      'base/klass',
      'base/element',
      'base/event'
   ], function (_k, _e, _v) {
     // code
   });
   ```

2. 文本模块

   > 推荐使用 import * as name from source; 的形式导入

   ```javascript
   // ES6 code
   import * as _tpl from './jobLeftBar.html';
   import * as _css from './jobLeftBar.css';

   // NEJ code
   define([
       'text!./jobLeftBar.html',
       'text!./jobLeftBar.css'
   ], function (_tpl, _css) {
     // code
   });
   ```

3. 自定义模块

   ```javascript
   // ES6 code
   import _createFolderWin from './createFolderWin/createFolderWin';
   import _contextMenu from 'components/contextMenu/contextMenu';
   import 'components/explorer/explorer'

   // NEJ code
   define([
       './createFolderWin/createFolderWin.js',
       'components/contextMenu/contextMenu',
       'components/explorer/explorer'
   ], function (_createFolderWin, _contextMenu) {
     // code
   })
   ```

4. 支持[NEJ自定义路径](https://github.com/genify/nej/blob/master/doc/DEPENDENCY.md#%E8%87%AA%E5%AE%9A%E4%B9%89%E8%B7%AF%E5%BE%84)

   这里做的转换是[babel-transform-nej-modules-es2015 支持NEJ自定义路径](https://github.com/Mammut-FE/babel-plugin-transform-nej-modules-es2015#转换规则) 的逆操作, 具体信息请前往查看

   通过添加配置信息`alias`

   ```
   alias = {
     'action': 'pro/action',
     'global': 'pro/global'
   }

   // 转换核心是将 'action' => /^common\b/ 来进行匹配
   ```

   转换结果

   ```javascript
   // ES6 code
   import treeList from 'commonponents/treeList/treeList';
   import editNode from 'common/editNode/editNode';
   import developActions from 'action/developActions';
   import util from 'global/util';

   // NEJ code
   define([
       'commonponents/treeList/treeList',
       'common/editNode/editNode',
       'pro/action/developActions',
       'pro/global/util'
   ], function(...) {
     // code
   });
   ```

   ​

## 示例代码

1. clone项目到本地

   ```
   git clone git@github.com:Mammut-FE/babel-plugin-transform-nej-modules-es2015.git
   ```

2. 安装依赖并编译

   ```
   npm i & npm run build
   ```

3. 进入`example`文件夹运行`transform.js`

   ```Shell
   cd example

   node transform.js			// 转换目录下的nej-code.js文件
   node transform.js code      // 转换 transform.js 中 code 对应的文本
   ```



## 已知问题

1. 目前只支持 `export default`这种导出



## 参与开发

1. 发现🐞或者有需求可以在issue中提出
2. 贡献代码的话请fork后以`pull request`的方式提交



觉得这个插件不错的话请给个 ⭐