# Guide

安装依赖：

```shell
$ npm install @likg/websocket
$ yarn add @likg/websocket
$ pnpm add @likg/websocket
```
调用语法：

```js
import KWebSocket from '@/libs/websocket';
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

1、基础使用

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

2、React

```react
"use client";
import { useEffect, useRef } from "react";
import KWebSocket from "@/libs/websocket";

export default function Page() {
  const socket = useRef<KWebSocket | null>(null);

	useEffect(() => {
		socket.current = new KWebSocket({
			debug: true,
			url: "ws://localhost:8080",
			onConnected: () => {
				// 拉取历史记录
			},
			onMessage: (_message: string) => {
				
			},
		});
    return () => {
      socket.current?.close()
    }
	}, []);
	return <div className="p-4 flex items-center gap-4">
    <button type="button" onClick={() => {
      socket.current?.send(`当前时间 ${new Date().toLocaleString()}`);
    }}>发送消息</button>
    <button type="button" onClick={() => {
      socket.current?.close()
    }}>关闭连接</button>
  </div>;
}
```

# Server

1、目录结构

```
tree -I 'node_modules'
.
├── index.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

2、初始化项目

```shell
$ mkdir wx && cd wx && npm init -y && code .
```

3、安装依赖

```shell
$ pnpm add -D @types/node @types/ws ts-node typescript
$ pnpm add ws
```

4、定义脚本

```json
{
  "scripts": {
    "dev": "ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}

```

5、`ts.config.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["index.ts"]
}
```

6、`index.ts`

```ts
// server.ts
import WebSocket, { WebSocketServer } from 'ws'

// 创建 WebSocket 服务器，监听 8080 端口
const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws: WebSocket) => {
  console.log('客户端已连接')
  ws.on('message', (message) => {
    console.log('收到客户端消息:', message.toString())
    ws.send(`服务器收到: ${message}`)
  })

  ws.send('欢迎连接 WebSocket 服务器！')
})

console.log('WebSocket 服务器已启动，端口 8080')
```

