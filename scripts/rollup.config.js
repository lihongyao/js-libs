import { defineConfig } from 'rollup';
import { generateRollupConfig, getPkgNames } from './utils';

const libs = ['metronome'];
const rollupConfigs = [];

const pkgNames = libs.length ? libs : getPkgNames();

pkgNames.forEach((pkgName) => {
	const pkgConfig = generateRollupConfig(pkgName);
	rollupConfigs.push(pkgConfig);
});

export default defineConfig(rollupConfigs);
