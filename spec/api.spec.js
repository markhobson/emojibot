const request = require("request");

describe('Api', () => {

    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    describe('when calling /explain', () => {

        it('should respond with matching word', (done) => {
            request.post({
                url: 'http://localhost:3000/explain',
                headers: {'Content-Type': 'text/plain'},
                body: 'text=pig%20:pig:'
            }, (error, response) => {
                const { response_type, text } = JSON.parse(response.body);

                expect(response_type).toBe('ephemeral');
                expect(text).toBe('I heard _pig_ which made me think of :pig:.');
                done();
            });
        });

        it('should respond with matching word that has multiple emoji', (done) => {
            request.post({
                url: 'http://localhost:3000/explain',
                headers: {'Content-Type': 'text/plain'},
                body: 'text=dog%20:poodle:'
            }, (error, response) => {
                const { response_type, text } = JSON.parse(response.body);

                expect(response_type).toBe('ephemeral');
                expect(text).toBe('I heard _dog_ which made me think of :poodle:.');
                done();
            });
        });

        it('should respond with message when no text', (done) => {
            request.post({
                url: 'http://localhost:3000/explain',
                headers: {'Content-Type': 'text/plain'},
                body: 'text=%20:pig:'
            }, (error, response) => {
                const { response_type, text } = JSON.parse(response.body);

                expect(response_type).toBe('ephemeral');
                expect(text).toBe('I don\'t understand.');
                done();
            });
        });

        it('should respond with message when emoji invalid', (done) => {
            request.post({
                url: 'http://localhost:3000/explain',
                headers: {'Content-Type': 'text/plain'},
                body: 'text=pig%20pig'
            }, (error, response) => {
                const { response_type, text } = JSON.parse(response.body);

                expect(response_type).toBe('ephemeral');
                expect(text).toBe('I don\'t understand.');
                done();
            });
        });

        it('should respond with message when no explanation', (done) => {
            request.post({
                url: 'http://localhost:3000/explain',
                headers: {'Content-Type': 'text/plain'},
                body: 'text=foo%20:pig:'
            }, (error, response) => {
                const { response_type, text } = JSON.parse(response.body);

                expect(response_type).toBe('ephemeral');
                expect(text).toBe('I never said that.');
                done();
            });
        });
    });

    describe('when calling /install', () => {

        it('should respond with install link', (done) => {
            request.get('http://localhost:3000/install', (error, response) => {
                const result = response.body;

                expect(result.includes('emojibot')).toBe(true);
                expect(result.includes('Click the button to add @emojibot to Slack!')).toBe(true);
                done();
            });
        });
    });
});
