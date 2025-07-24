# 概述

Scheme是一种页面内跳转协议，通过定义自己的Scheme协议，可以非常方便的跳转APP中的各个页面，Scheme格式如下：

```markdown
[scheme]://[host]/[path]?[query]
```

其中：

- scheme：一般为APP英文名称；
- host：域名（随意即可）；
- path：路径；
- query：携带参数；

比如，我们公司产品 [D豆（DDOU）] 应用定义的Scheme协议就为：`ddou://www.d-dou.com` 。

# 初衷

为了方便H5开发者使用，提高开发效率，所以空闲时间开发了 `lg-schemes` 库。

如果你希望在你的项目中应用此库，那么原生开发者需严格按照如下约定处理Scheme跳转。

以D豆为例，大致分为以下4类：

1. **原生跳转H5页面**

   scheme地址：`ddou://www.d-dou.com/push`

   关键词：`/push`

   **示例：**

   ```ini
   ddou://www.d-dou.com/push?url=encodeURIComponent(http[s]://xxx.com?needHeader=?&appBack=?&xxx=xxx)
   ```

   其中，`url` 为传递给原生的参数（即H5跳转链接），需编码。

   在H5链接中固定了两个query参数：

   - `needHeader`：是否需要原生实现导航栏（0为不需要，1为需要）
   - `appBack`：点击导航栏上的返回按钮是否需要调用原生返回，0为不需要，1为需要

2. **H5跳转原生页面**

   scheme地址：`ddou://www.d-dou.com/jump/path?xxx=xxx`

   关键词：`/jump`

   > 说明：`path` 为原生路由，`?xxx=xxx` 为H5传递给原生的数据。在开发中，**原生开发者需拟定原生路由参照表供H5、后台及测试人员使用。**

   **示例：**

   ```ini
   ddou://www.d-dou.com/jump/login?uuid=123
   ```

   上述地址表示跳转至原生的登录页（`/login`），并且传递参数 `uuid` 过去。

3. **切换tab页**

   scheme地址：`ddou://www.d-dou.com/switch?index=x`

   关键词：`/switch`

   > 说明：`index` 为原生tab栏上对应的下标，比如首页，`index` 值为 `0`。

4. **原生打开外部浏览器**

   scheme地址：`ddou://www.d-dou.com/browser?url=xxx`

   关键词：`/browser`

   其中，url为需要原生打开的H5地址（外部链接）

# 安装

```shell
$ npm install @likg/schemes
$ yarn add @likg/schemes
$ pnpm add @likg/schemes
```

# 使用

使用之前，你需要全局配置scheme

```tsx
import Schemes from '@likg/schemes';

Schemes.config('scheme地址', '二级目录地址');
```

> 提示：
>
> - 如果你的项目部署在二级目录下，还需配置二级目录地址。
> - scheme地址通常为Host部分，如D豆，你的配置方式应该是这样的：
>
>   ```js
>   Schemes.config('ddou://www.d-dou.com');
>   ```

具体API如下；

```typescript
interface PushOptions {
    query?: Record<string, any>;
    needHeader?: 0 | 1;
    appBack?: 0 | 1;
}

/**
 * 全局配置项，你应该在项目初始化时调用config进行配置。
 *
 * @param scheme scheme地址，只需要配置前缀，如：ddou://www.d-dou.com
 * @param base 二级目录地址
 */
config(scheme: string, base?: string): void;
/**
 * 跳转H5页面
 *
 * @param path H5路由
 * @param options  可选项
 */
push(path: string, options?: PushOptions): void;
/**
 * 切换原生tab页
 * @param index
 */
switchTab(index: number): void;
/**
 * 跳转原生页面
 *
 * @param path
 */
jump(path: string, params?: Record<string, any>): void;
/**
 * 原生打开外部浏览器
 * @param url 资源地址
 */
openBrowser(url: string): void;
```
