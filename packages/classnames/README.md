# 概述

处理 class，类似于Vue动态添加class。

# 安装

```shell
$ npm install @likg/classnames
# OR
$ yarn add @likg/classnames
# OR
$ pnpm add @likg/classnames
```

# 使用

```javascript
import classNames from '@likg/classnames';

// 1. 传入字符串
classNames('bar foo  '); // bar foo

// 2. 传入对象
classNames({
	bar: true,
	foo: false,
	wrapper: true
}); // bar wrapper

// 3. 传入数组
classNames(['bar', 'foo']); // bar foo

// 4. 传入数组+对象
classNames([
	'bar',
	{
		foo: true,
		tips: false
	},
	'lg'
]); // bar foo lg

// 4. undefined
let customCls;
let clearCls = 'clear';
classNames(['wrapper', customCls, clearCls]); // wrapper clear
```
