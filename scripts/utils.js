// scripts/utils.js
import fs from "node:fs";
import path from "node:path";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import eslint from "@rollup/plugin-eslint";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import postcss from "rollup-plugin-postcss";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;
const pkgPath = path.resolve(__dirname, "../packages");

const commonPlugins = (pkgName) => [
	del.default({ targets: `${pkgPath}/${pkgName}/dist/**/*` }),
	eslint({
		include: ["src/**"],
		exclude: ["node_modules/**"],
		throwOnError: true,
		throwOnWarning: true,
	}),
	resolve(),
	commonjs(),
	typescript({
		tsconfig: `${pkgPath}/${pkgName}/tsconfig.json`,
		sourceMap: isDevelopment,
	}),
	babel({
		extensions: [".js", ".ts"],
		exclude: "node_modules/**",
		babelHelpers: "bundled",
	}),
	postcss({
		plugins: [],
	}),
];
const devPlugins = [];
const proPlugins = [
	terser({
		compress: {
			drop_console: false,
			drop_debugger: true,
		},
		format: {
			comments: (_, comment) => {
				return /eslint-disable/.test(comment.value); // 不删除eslint的注释
			},
		},
	}),
];

/**
 * 获取需要打包的文件路径
 * @param {*} libs
 */
export function getPkgNames() {
	const filenames = fs.readdirSync(pkgPath, { encoding: "utf-8" });
	return filenames.filter((filename) => /^[\w-]+$/.test(filename));
}

/**
 * 解析路径
 * @param {*} pkgName 包名
 * @param {*} isDist 是否dist目录
 * @returns
 */
function resolvePath(pkgName, isDist) {
	if (isDist) {
		return `${pkgPath}/${pkgName}/dist`;
	}
	return `${pkgPath}/${pkgName}`;
}

/**
 * 读取package.json文件
 * @param {*} pkgName 包名
 * @returns
 */
function getPackageJSON(pkgName) {
	const path = `${resolvePath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: "utf8" });
	return JSON.parse(str);
}

/**
 * 生成output配置
 * @param {*} formats 打包格式
 * @param {*} distPath 输出目录
 * @param {*} moduleName 模块名称
 * @returns
 */
function generateOutputs(formats, distPath, moduleName) {
	const outputs = [];
	formats.forEach((format) => {
		outputs.push({
			file: `${distPath}/index.${format}.js`,
			format,
			name: ["iife", "umd"].includes(format) ? moduleName : undefined,
			sourcemap: false,
			banner: "/* eslint-disable */\n",
		});
	});
	return outputs;
}

/**
 * 生成rollup配置
 * @param {*} pkgName 包名
 * @returns
 */
export function generateRollupConfig(pkgName) {
	const pkgPath = resolvePath(pkgName);
	const distPath = resolvePath(pkgName, true);
	const { buildOptions } = getPackageJSON(pkgName);
	return {
		input: `${pkgPath}/src/index.ts`,
		output: generateOutputs(
			buildOptions.formats,
			distPath,
			buildOptions.moduleName,
		),
		plugins: [
			...commonPlugins(pkgName),
			...(isProduction ? proPlugins : devPlugins),
		],
	};
}
