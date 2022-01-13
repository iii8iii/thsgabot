const { firefox } = require('playwright-firefox');
const { thsBot } = require('@iii8iii/thsbot');
const { WechatBot } = require('@iii8iii/wechatbot');
require('dotenv').config();
(async () => {
	const browser = await firefox.launch({ headless: false });
	const ctx = await browser.newContext();
	const wechatBot = new WechatBot(process.env.botUrls.split(','));
	const ths = new thsBot(ctx, process.env.USER, process.env.USERPSW, wechatBot);

	ths.update(['123456']);
})();
