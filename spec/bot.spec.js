const Bot = require('../src/bot.js');

describe('Bot', () => {
	let web;
	let bot;
	
	beforeEach(() => {
		web = {
			chat: {
				postMessage: () => Promise.resolve()
			}
		};
		bot = new Bot(web);
	});
	
	it('should respond with emoji', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'dog', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':dog:');
	});
});
