# 使用指南

安装依赖

```shell
$ npm install @likg/cookie
# OR
$ yarn add @likg/cookie
# OR
$ pnpm add @likg/cookie
```

使用

```tsx
import Cookie from '@likg/cookie';
// 1. 查询所有
Cookie.get();
// 2. 查询指定值
Cookie.get('token');
// 3. 设置值
Cookie.set('status', 1);
// 4. 删除指定值
Cookie.del('token');
// 5. 删除所有
Cookie.del();
// 6. 批量删除
Cookie.del(['token', 'status']);
```
