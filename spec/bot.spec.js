const Bot = require('../src/bot.js');

describe('Bot', () => {
	let web;
	let bot;
	
	beforeEach(() => {
		web = {
			chat: {
				postMessage: () => Promise.resolve()
			},
			reactions: {
				add: () => Promise.resolve()
			}
		};
		bot = new Bot(web);
		
		spyOn(web.chat, 'postMessage').and.callThrough();
		spyOn(web.reactions, 'add').and.callThrough();
	});
	
	describe('when in channel', () => {
		const channel = 'C1234567890';
		
		it('should react with matching emoji', () => {
			bot.process({text: 'pig', channel: channel, event_ts: '1234567890.123456'}, 'token');
			
			expect(web.reactions.add).toHaveBeenCalledWith('pig', {channel: channel, timestamp: '1234567890.123456'});
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
		
		it('should not respond when no matches', () => {
			bot.process({text: 'foo', channel: channel}, 'token');
			
			expect(web.reactions.add).not.toHaveBeenCalled();
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
	});
	
	describe('when in direct message', () => {
		const channel = 'D1234567890';
		
		it('should respond with matching emoji', () => {
			bot.process({text: 'pig', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':pig:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with matching emoji ignoring case', () => {
			bot.process({text: 'PIG', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':pig:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for plurals', () => {
			bot.process({text: 'pigs', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':pig:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for singulars', () => {
			bot.process({text: 'eye', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':eyes:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for matching word', () => {
			bot.process({text: 'foo pig foo', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':pig:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with random emoji for matching word', () => {
			bot.process({text: 'dog', channel: channel}, 'token');
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith(channel, jasmine.stringMatching(/(:dog:|:feet:|:poodle:|:wolf:)/));
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for a random matching word', () => {
			bot.process({text: 'horse pig wolf', channel: channel}, 'token');
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith(channel, jasmine.stringMatching(/(:horse:|:pig:|:wolf:)/));
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for synonyms', () => {
			bot.process({text: 'woof', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, ':dog:');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for single letter words', () => {
			bot.process({text: 'a', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, 'I have nothing.');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for common words', () => {
			bot.process({text: 'like', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, 'I have nothing.');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for hyperlinks', () => {
			bot.process({text: 'http://pig.com', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, 'I have nothing.');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for mentions', () => {
			bot.process({text: '@pig', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, 'I have nothing.');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message when no matches', () => {
			bot.process({text: 'foo', channel: channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith(channel, 'I have nothing.');
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
	});
});
