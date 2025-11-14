/**
 * 对象类型/限制值只能是布尔类型
 */
interface IObject {
	[key: string]: boolean | undefined;
}

/**
 * 获取数据类型
 * @param target
 */
function _getType(target: any) {
	return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}
/**
 * 处理字符串中的空格/去除字符串两边的左右空格/字符串内如果连续出现多个空格则只保留一个
 * @param target
 */
function _trim(target: string) {
	return target.trim().replace(/\s+/g, " ");
}

/**
 * class 转换，只接受字符串类型、数组类型、对象类型或undefined
 * 数组类型里面只能是字符串类型和对象类型
 * 注意：这里的对象类型的值只能是布尔类型或undefined
 * eg. classnames('a') ==> 'a'
 * eg. classnames({a: true, b: false}) ==> 'a'
 * eg. classnames(['a', { b: true, c: false }]) ==> 'a b'
 * @param v
 */
function classNames(v: string | (string | IObject | undefined)[] | IObject) {
	const type = _getType(v);
	const includes = ["string", "object", "array"];
	// 如果传入的数据类型不是可选类型则直接返回空字符串
	if (includes.indexOf(type) === -1) {
		return "";
	}
	// 如果是字符串，则直接返回
	if (type === "string") {
		return _trim(v as string);
	}
	// 如果是对象类型，则遍历对象，根据对象值是true还是false来返回class
	if (type === "object") {
		let r = "";
		const o = v as IObject;
		Object.keys(o).forEach((key) => {
			const value = o[key];
			if (value) {
				r += `${key} `;
			}
		});
		return _trim(r);
	}
	// 如果是数组类型，则遍历数组
	if (type === "array") {
		let r = "";
		const arr = v as any[];
		arr.forEach((item) => {
			r += `${classNames(item)} `;
		});
		return _trim(r);
	}
	return "";
}

export default classNames;
