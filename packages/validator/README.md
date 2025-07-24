# 概述

本库提供常用正则表达式验证

# 使用

1. 安装

```shell
$ npm install @likg/validator
$ yarn add @likg/validator
$ pnpm i @likg/validator
```

2. 使用

```typescript
import Validator from 'lg-validator';
if (Validator.ios()) {
	console.log('iOS环境');
}
if (Validator.tel('17398888669')) {
	console.log('手机号验证通过');
}
```

# API

```typescript
/**
 * 中文名校验
 * @param v
 */
static isUsername(v: string): boolean;
/**
 * 身份证校验
 * @param v
 */
static isIdCard(v: string): boolean;
/**
 * 验证微信号
 * 1. 可使用6-20个字母、数字、下划线和减号；
 * 2. 必须以字母开头（字母不区分大小写）；
 * 3. 不支持设置中文；
 * @param v
 */
static isWeChatId(v: string): boolean;
/**
 * 验证QQ号
 * @param v
 */
static isQQ(v: string): boolean;
/**
 * 验证邮箱
 * @param v
 */
static isEmail(v: string): boolean;
/**
 * 验证手机号
 * @param v
 */
static isTel(v: string): boolean;
/**
 * 验证手机验证码
 * @param v
 */
static isCode(v: string): boolean;
/**
 * 验证Android环境
 */
static isAndroid(): boolean;
/**
 * 验证iOS环境
 */
static isiOS(): boolean;
/**
 * 验证微信环境
 */
static isWeixin(): boolean;
/**
 * 验证是否是刘海屏
 */
static isBangScreen(): boolean;
/**
 * 判断是否是有效日期
 * @param date
 * @returns
 */
static isValidDate(date: Date): boolean;
/**
 * 判断某个日期是否是今日
 * @param $
 * @returns
 */
static isToday(v: Date | string | number): boolean;
/**
 * 校验目标值是否是一个JSON字符串
 * @param target
 * @returns
 */
static isJSON(target: any): boolean;
/**
 * 检验目标字符串是否包含音频后缀
 * @param src
 */
static isAudio(src: string): boolean;
/**
 * 检验目标字符串是否包含视频后缀
 * @param src
 */
static isVideo(src: string): boolean;
/**
 * 校验文件尺寸/扩展名
 * @param options
 * @returns
 */
static checkFile(options: ICheckFileSize | ICheckFileExtension): boolean;
/**
 * 车牌号校验
 * @param plate
 * @returns
 */
static isLicensePlate(plate: string): boolean;
/**
 * 驾驶证号校验（粗率）
 * @param license
 * @returns
 */
static isDriverLicense(license: string): boolean;
/**
 * 行驶证号校验（粗率）
 * @param license
 * @returns
 */
static isVehicleLicense(license: string): boolean;
```
