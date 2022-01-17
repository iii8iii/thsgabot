const { firefox } = require('playwright-firefox');
const { WechatBot } = require('@iii8iii/wechatbot');
const { thsBot } = require('@iii8iii/thsbot');
const { ljxt } = require('@iii8iii/analysts');
const {
	getQsStocksInfo,
	getKlineData,
	getZtStocksInfo,
} = require('@iii8iii/dfcfbot');
const _ = require('lodash');
require('dotenv').config();

const init = async () => {
	const hdl = process.env.NODE_ENV === 'production';
	const browser = await firefox.launch({ headless: hdl });
	const ctx = await browser.newContext();
	const wechatBot = new WechatBot(process.env.botUrls.split(','));
	const ths = new thsBot(ctx, process.env.USER, process.env.USERPSW, wechatBot);
	return { browser, ths };
};

const getCodes = async () => {
	let codes = [];

	const zt = await getZtStocksInfo();
	const qs = await getQsStocksInfo(500);

	const qsDiffZt = _.differenceBy(qs, zt, 'c');
	for (const q of qsDiffZt) {
		const { c, zdp } = q;
		let dData = undefined;
		zdp > -5 && (dData = await getKlineData(c, 'D'));
		dData && ljxt(dData) && codes.push(c);
	}
	return codes;
};

const update = async (ths, s) => {
	console.log('------update begin------');
	const codes = await getCodes();
	await ths.update(codes, '399006');
	console.log('------updating------');
	Date.now() - s < 60 * 60 * 1000 && (await update(ths, s));
	console.log('------update end------');
};

const start = async () => {
	const s = Date.now();
	const { browser, ths } = await init();
	await update(browser, ths, s);
	await browser.close();
	console.log('------browser closed------');
};

start();
