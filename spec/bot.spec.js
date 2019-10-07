const Bot = require('../src/bot.js');

describe('Bot', () => {
	let web;
	
	beforeEach(() => {
		web = {
			chat: {
				postMessage: () => Promise.resolve()
			},
			reactions: {
				add: () => Promise.resolve()
			}
		};
		
		spyOn(web.chat, 'postMessage').and.callThrough();
		spyOn(web.reactions, 'add').and.callThrough();
	});
	
	describe('when in channel', () => {
		const channel = 'C1234567890';
		
		it('should react with matching emoji', () => {
			Bot.process({text: 'pig', channel, event_ts: '1234567890.123456'}, web);
			
			expect(web.reactions.add).toHaveBeenCalledWith({name: 'pig', channel, timestamp: '1234567890.123456'});
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
		
		it('should not respond when no matches', () => {
			Bot.process({text: 'foo', channel}, web);
			
			expect(web.reactions.add).not.toHaveBeenCalled();
			expect(web.chat.postMessage).not.toHaveBeenCalled();
		});
	});
	
	describe('when in direct message', () => {
		const channel = 'D1234567890';
		
		it('should respond with matching emoji', () => {
			Bot.process({text: 'pig', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with matching emoji ignoring case', () => {
			Bot.process({text: 'PIG', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for plurals', () => {
			Bot.process({text: 'pigs', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for singulars', () => {
			Bot.process({text: 'eye', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':eyes:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for matching word', () => {
			Bot.process({text: 'foo pig foo', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':pig:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with random emoji for matching word', () => {
			Bot.process({text: 'dog', channel}, web);
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith({channel, text: jasmine.stringMatching(/(:dog:|:feet:|:poodle:|:wolf:)/)});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for a random matching word', () => {
			Bot.process({text: 'horse pig wolf', channel}, web);
			
			expect(web.chat.postMessage)
				.toHaveBeenCalledWith({channel, text: jasmine.stringMatching(/(:horse:|:pig:|:wolf:)/)});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with emoji for synonyms', () => {
			Bot.process({text: 'woof', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: ':dog:'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for single letter words', () => {
			Bot.process({text: 'a', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for stop words', () => {
			Bot.process({text: 'it', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for hyperlinks', () => {
			Bot.process({text: 'http://pig.com', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message for mentions', () => {
			Bot.process({text: '@pig', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should respond with message when no matches', () => {
			Bot.process({text: 'foo', channel}, web);
			
			expect(web.chat.postMessage).toHaveBeenCalledWith({channel, text: 'I have nothing.'});
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should not respond to bot message', () => {
			Bot.process({text: 'foo', channel, subtype: 'bot_message'}, web);
			
			expect(web.chat.postMessage).not.toHaveBeenCalled();
			expect(web.reactions.add).not.toHaveBeenCalled();
		});
		
		it('should not respond to slash command', () => {
			Bot.process({text: '/pig pig', channel}, web);
			
			expect(web.chat.postMessage).not.toHaveBeenCalled();
			expect(web.reactions.add).not.toHaveBeenCalled();
		})
	});
	
	describe('when explaining', () => {
		
		it('should respond with matching word', () => {
			const response = Bot.explain('pig', ':pig:');
			
			expect(response).toBe('I heard _pig_ which made me think of :pig:.');
		});
		
		it('should respond with matching word that has multiple emoji', () => {
			const response = Bot.explain('dog', ':poodle:');
			
			expect(response).toBe('I heard _dog_ which made me think of :poodle:.');
		});
		
		it('should respond with random matching word', () => {
			const response = Bot.explain('dog pet poodle', ':poodle:');
			
			expect(response).toMatch(/I heard _(dog|pet|poodle)_ which made me think of :poodle:\./);
		});
		
		it('should respond with message when no text', () => {
			const response = Bot.explain('', ':pig:');
			
			expect(response).toBe('I don\'t understand.');
		});
		
		it('should respond with message when emoji invalid', () => {
			const response = Bot.explain('pig', 'pig');
			
			expect(response).toBe('I don\'t understand.');
		});
		
		it('should respond with message when no explanation', () => {
			const response = Bot.explain('foo', ':pig:');
			
			expect(response).toBe('I never said that.');
		});
	});
	
});
