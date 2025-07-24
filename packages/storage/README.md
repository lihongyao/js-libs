# 概述

为了方便对JSAPI LocalStorage的使用，这里封装lg-storage库简化操作。

```shell
# 安装
$ npm install @likg/storage
$ yarn add @likg/storage
$ pnpm add @likg/storage
```

# API

```typescript
/**
 * 存储数据
 * @param key 键
 * @param value 值
 */
static set(key: string, value: any): void;
/**
 * 读取数据
 * @param key 键
 * @returns
 */
static get<T = any>(key: string): T | null;
/**
 * 移除数据
 * key的类型可以为字符串、字符串数组以及undefined
 * 根据不同类型，有如下三种结果：
 * - 当key为字符串时/移除指定key对应的数据
 * - 当key为字符串数组时/遍历删除指定key对应的数据
 * - 当key为undefined时/清空所有本地数据
 * @param key
 */
static del(key?: string | string[]): void;
```
