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
		
		bot.process({text: 'pig', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':pig:');
	});
	
	it('should respond with matching emoji ignoring case', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'PIG', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':pig:');
	});
	
	it('should respond with emoji for plurals', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'pigs', channel: 'channel'}, 'token');

		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':pig:');
	});

	it('should respond with emoji for singulars', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'eye', channel: 'channel'}, 'token');

		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':eyes:');
	});
	
	it('should respond with emoji for matching word', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'foo pig foo', channel: 'channel'}, 'token');

		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':pig:');
	});
	
	it('should respond with random emoji for matching word', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'dog', channel: 'channel'}, 'token');

		expect(web.chat.postMessage)
			.toHaveBeenCalledWith('channel', jasmine.stringMatching(/(:dog:|:feet:|:poodle:|:wolf:)/));
	});
	
	it('should respond with emoji for a random matching word', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();

		bot.process({text: 'horse pig wolf', channel: 'channel'}, 'token');

		expect(web.chat.postMessage)
			.toHaveBeenCalledWith('channel', jasmine.stringMatching(/(:horse:|:pig:|:wolf:)/));
	});
	
	it('should respond with emoji for synonyms', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'woof', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', ':dog:');
	});
	
	it('should respond with message for single letter words', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'a', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
	
	it('should respond with message for common words', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'like', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
	
	it('should respond with message when no matches', () => {
		spyOn(web.chat, 'postMessage').and.callThrough();
		
		bot.process({text: 'foo', channel: 'channel'}, 'token');
		
		expect(web.chat.postMessage).toHaveBeenCalledWith('channel', 'I have nothing.');
	});
});
