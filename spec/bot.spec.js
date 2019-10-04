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
			bot.process({text: 'pig', channel, event_ts: '1234567890.123456'}, 'token');
			
			expect(web.reactions.add).toHaveBeenCalledWith({name: 'pig', channel, timestamp: '1234567890.123456'});
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
		
		it('should not respond when no matches', () => {
			bot.process({text: 'foo', channel}, 'token');
			
			expect(web.reactions.add).not.toHaveBeenCalled();
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
	});
	
	describe('when in direct message', () => {
		const channel = 'D1234567890';
		
		it('should respond with matching emoji', () => {
			bot.process({text: 'pig', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with matching emoji ignoring case', () => {
			bot.process({text: 'PIG', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for plurals', () => {
			bot.process({text: 'pigs', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for singulars', () => {
			bot.process({text: 'eye', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':eyes:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for matching word', () => {
			bot.process({text: 'foo pig foo', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with random emoji for matching word', () => {
			bot.process({text: 'dog', channel}, 'token');
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith({channel, text: jasmine.stringMatching(/(:dog:|:feet:|:poodle:|:wolf:)/)});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for a random matching word', () => {
			bot.process({text: 'horse pig wolf', channel}, 'token');
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith({channel, text: jasmine.stringMatching(/(:horse:|:pig:|:wolf:)/)});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for synonyms', () => {
			bot.process({text: 'woof', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':dog:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for single letter words', () => {
			bot.process({text: 'a', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for stop words', () => {
			bot.process({text: 'and', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for hyperlinks', () => {
			bot.process({text: 'http://pig.com', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for mentions', () => {
			bot.process({text: '@pig', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message when no matches', () => {
			bot.process({text: 'foo', channel}, 'token');
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
	});
});
