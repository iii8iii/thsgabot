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

(async () => {
	const hdl = process.env.NODE_ENV === 'production';
	const browser = await firefox.launch({ headless: hdl });
	const ctx = await browser.newContext();
	const wechatBot = new WechatBot(process.env.botUrls.split(','));
	const ths = new thsBot(ctx, process.env.USER, process.env.USERPSW, wechatBot);

	const update = async (ms) => {
		let codes = [];

		const zt = await getZtStocksInfo();
		const qs = await getQsStocksInfo(500);

		const qsDiffZt = _.differenceBy(qs, zt, 'c');
		for (const q of qsDiffZt) {
			const { c, zdp } = q;
			const dData = await getKlineData(c, 'D');
			if (ljxt(dData) && zdp > -3) {
				codes.push(c);
			}
		}

		await ths.update(codes, '399006');

		console.log('update done, waitting for next run...');
		setTimeout(() => {
			update(ms);
		}, ms);
	};

	update(60 * 1000);
})();
