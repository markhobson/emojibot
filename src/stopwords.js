// English stop words

// Lifted from Lucene:
// https://github.com/apache/lucene-solr/blob/master/lucene/core/src/java/org/apache/lucene/analysis/standard/StandardAnalyzer.java
const luceneStopwords = [
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'but',
	'by',
	'for',
	'if',
	'in',
	'into',
	'is',
	'it',
	'no',
	'not',
	'of',
	'on',
	'or',
	'such',
	'that',
	'the',
	'their',
	'then',
	'there',
	'these',
	'they',
	'this',
	'to',
	'was',
	'will',
	'with'
];

// Additional words that have tenuous emojis
const additionalStopwords = [
	'has',
	'have',
	'here',
	'like',
	'so',
	'up',
	'us',
	'you',
	'what'
];

module.exports = luceneStopwords.concat(additionalStopwords)
	.reduce((map, next) => map.set(next, true), new Map());
