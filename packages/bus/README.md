# 概述

类似于eventBus，使用发布订阅者模式实现事件分发中心。

# 安装

```shell
$ npm install --save-dev @likg/bus
# OR
$ yarn add @likg/bus
# OR
$ pnpm add @likg/bus
```

# 导入

```typescript
import Bus from '@likg/bus';
```

# 使用

```JavaScript
// 1. 添加事件
Bus.$on(事件名称, 事件处理函数);
// 2. 触发事件
Bus.$emit(事件名称, 参数1[, 参数2, 参数3...]);
// 3. 移除事件
Bus.$off(事件名称, 事件处理函数);

```
