// src/utils/cookie.ts
export interface CookieOptions {
	path?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}

/**
 * 添加/修改 cookie
 * @param key 键
 * @param value 值
 * @param expireDays 过期时间（天）
 * @param options 额外选项
 */
export function setCookie(
	key: string,
	value: string | number,
	expireDays = 1,
	options?: CookieOptions,
) {
	if (typeof value !== "string" && typeof value !== "number") return;

	const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
	const parts = [
		`${key}=${encodeURIComponent(value)}`,
		`expires=${expires.toUTCString()}`,
		`path=${options?.path ?? "/"}`,
	];

	if (options?.secure) parts.push("Secure");
	if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);

	// 使用赋值，但通过封装函数统一管理
	document.cookie = parts.join("; ");
}

/**
 * 读取 cookie，如果 key 存在则返回对应值，否则返回所有 cookie
 */
export function getCookie<T>(key?: string): T {
	if (!document.cookie) return (key ? "" : {}) as T;

	const pairs = document.cookie.split(";");
	const result: Record<string, string> = {};

	pairs.forEach((str) => {
		const [k, v] = str.trim().split("=");
		if (k && v !== undefined) {
			result[decodeURIComponent(k)] = decodeURIComponent(v);
		}
	});

	const res: unknown = key ? (result[key] ?? "") : result;
	return res as T;
}

/**
 * 删除 cookie，如果 key 存在则删除指定 cookie，否则清空所有 cookie
 */
export function delCookie(key?: string | string[], options?: CookieOptions) {
	const expires = new Date(0);

	const buildCookie = (k: string) =>
		`${k}=0;expires=${expires.toUTCString()};path=${options?.path ?? "/"}${
			options?.secure ? ";Secure" : ""
		}${options?.sameSite ? `;SameSite=${options.sameSite}` : ""}`;

	if (!key) {
		// 删除所有 cookie
		const keys = document.cookie.match(/[^ =;]+(?==)/g) ?? [];
		keys.forEach((k) => {
			document.cookie = buildCookie(k);
		});
		return;
	}

	if (typeof key === "string") {
		document.cookie = buildCookie(key);
	} else if (Array.isArray(key)) {
		key.forEach((k) => {
			document.cookie = buildCookie(k);
		});
	}
}
