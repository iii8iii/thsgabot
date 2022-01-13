const { firefox } = require('playwright-firefox');
const { thsBot } = require('@iii8iii/thsbot');
const { WechatBot } = require('@iii8iii/wechatbot');
require('dotenv').config();
(async () => {
	const hdl = process.env.NODE_ENV === 'production';
	const browser = await firefox.launch({ headless: hdl });
	const ctx = await browser.newContext();
	const wechatBot = new WechatBot(process.env.botUrls.split(','));
	const ths = new thsBot(ctx, process.env.USER, process.env.USERPSW, wechatBot);

	ths.update(['123456']);
})();
