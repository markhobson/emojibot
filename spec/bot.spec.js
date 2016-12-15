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
	
	it('should respond with matching emoji', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'dog', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':dog:');
	});
	
	it('should respond with emoji for plurals', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'dogs', channel: 'channel'}, 'token');

		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':dog:');
	});

	it('should respond with emoji for singulars', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'eye', channel: 'channel'}, 'token');

		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':eyes:');
	});
	
	it('should respond with message for single letter words', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'a', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
	
	it('should respond with message for double letter words', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'it', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
	
	it('should respond with message when no matches', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'foo', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
});
