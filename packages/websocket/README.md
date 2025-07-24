# Guide

安装依赖：

```shell
$ npm install @likg/websocket
$ yarn add @likg/websocket
$ pnpm add @likg/websocket
```

调用语法：

```js
import KWebSocket from '@likg/websocket';
const socket = new KWebSocket(options);
```

# APIs

## Options

```ts
export interface KWebSocketOptions {
	/** 是否启用调试模式，默认值：false */
	debug?: boolean;
	/** 连接地址，格式一般为：ws[s]://SERVER_HOST[/path][?query] */
	url: string;
	/** 最大重连次数，默认值：5 */
	maxReconnectTimes?: number;
	/** 重连间隔，单位（毫秒），默认值：10 * 1000 */
	reconnectInterval?: number;
	/** 心跳间隔，单位（毫秒），默认值：10 * 1000 */
	heartInterval?: number;
	/** 心跳描述字符串，默认值：heartbeat */
	heartString?: string;
	/** 连接成功回调/触发时机：首次连接成功和断线重新连接后 */
	onConnected: () => void;
	/** 收到服务器消息回调 */
	onMessage: (message: string) => void;
}
```

## Methods

- `socket.send()`：发送消息
- `socket.close()`：关闭socket链接

# Examples

```js
const socket = new KWebSocket({
  debug: true,
  url: "WebSocket Uri",
  onConnected: () => {
    // 拉取历史记录
  },
  onMessage: (message: string) => {
    console.log(message);
  },
});
// -- 发送消息
socket.send(msg);
// -- 关闭连接
socket.close();
```
