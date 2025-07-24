/*
 * @Author: Li-HONGYAO
 * @Date: 2021-04-07 18:00:49
 * @LastEditTime: 2023-08-17 13:29:38
 * @LastEditors: Lee
 * @Description:
 * @FilePath: /lg-storage/src/index.ts
 */
class Storage {
	/**
	 * 存储数据
	 * @param key 键
	 * @param value 值
	 */
	public static set(key: string, value: any) {
		localStorage.setItem(key, JSON.stringify(value));
	}
	/**
	 * 读取数据
	 * @param key 键
	 * @returns
	 */
	public static get<T = any>(key: string): T | void {
		const data = localStorage.getItem(key);
		if (data) {
			return JSON.parse(data) as T;
		}
	}
	/**
	 * 移除数据
	 * key的类型可以为字符串、字符串数组以及undefined
	 * 根据不同类型，有如下三种结果：
	 * - 当key为字符串时/移除指定key对应的数据
	 * - 当key为字符串数组时/遍历删除指定key对应的数据
	 * - 当key为undefined时/清空所有本地数据
	 * @param key
	 */
	public static del(key?: string | string[]) {
		const type = Object.prototype.toString.call(key).slice(8, -1).toLowerCase();
		if (key) {
			if (type === 'string') {
				localStorage.removeItem(key as string);
			} else if (type === 'array') {
				const keys = key as string[];
				keys.forEach((_key) => {
					localStorage.removeItem(_key);
				});
			}
		} else {
			localStorage.clear();
		}
	}
	/**
	 * 查找元素
	 * @param key
	 * @param indexes
	 * @param value
	 * @returns
	 */
	public static arrFind<T = any>(key: string, indexes: keyof T, value: any) {
		if (!key || !indexes || !value) {
			return;
		}
		const _ = localStorage.getItem(key);
		if (_) {
			const arr = JSON.parse(_) as T[];
			return arr.find((item) => item[indexes] === value);
		}
		return;
	}
	/**
	 * 列表存储
	 * @param key
	 * @param obj
	 */
	public static arrSave<T = any>(key: string, obj: T, indexes?: keyof T) {
		return new Promise((resolve, reject) => {
			if (!key || !obj) {
				reject('参数不完整');
				return;
			}
			let arr: T[] = [];
			const _ = localStorage.getItem(key);
			if (_) {
				arr = JSON.parse(_) as T[];
			}
			if (indexes) {
				const i = arr.findIndex((item) => item[indexes] === obj[indexes]);
				if (i !== -1) {
					arr.splice(i, 1, obj);
				} else {
					arr.push(obj);
				}
			} else {
				arr.push(obj);
			}
			localStorage.setItem(key, JSON.stringify(arr));
			resolve(null);
		});
	}
	/**
	 * 获取列表
	 * @param key
	 * @returns
	 */
	public static arrGet<T = any>(key: string) {
		if (!key) {
			return [] as T[];
		}
		const _ = localStorage.getItem(key);
		if (_) {
			return JSON.parse(_) as T[];
		}
		return [] as T[];
	}
	/**
	 * 移除列表数据
	 * 如果indexes和value没有传递，则表示清空列表
	 * 如果要移除字段，请调用Storage.del(key: string)
	 * @param key 存储键
	 * @param indexes 索引
	 * @param value 索引值
	 * @returns
	 */
	public static arrDel<T = any>(key: string, indexes?: keyof T, value?: any) {
		if (!key) return;
		const _ = localStorage.getItem(key);
		if (_) {
			const arr = JSON.parse(_) as T[];
			if (indexes && value) {
				const i = arr.findIndex((item) => item[indexes] === value);
				if (i !== -1) {
					arr.splice(i, 1);
					localStorage.setItem(key, JSON.stringify(arr));
				}
			} else {
				localStorage.setItem(key, JSON.stringify([]));
			}
		}
	}
}
export default Storage;
