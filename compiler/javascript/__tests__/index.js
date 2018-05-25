/**
 * @since 20180503 11:42
 * @author vivaxy
 */

const test = require('ava');
const compiler = require('../index.js');
const tokenTypes = compiler.tokenTypes;
const astTypes = compiler.astTypes;
const tokenizer = compiler.tokenizer;
const parser = compiler.parser;
const execute = compiler.execute;

test('tokenizer', (t) => {
  t.deepEqual(tokenizer('{{userGrade}} == 0'), [
    {
      type: tokenTypes.ARGUMENT,
      value: 'userGrade',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '==',
    },
    {
      type: tokenTypes.NUMBER,
      value: 0,
    },
  ]);

  t.deepEqual(tokenizer('"test"===\'value\''), [
    {
      type: tokenTypes.STRING,
      value: 'test',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '===',
    },
    {
      type: tokenTypes.STRING,
      value: 'value',
    },
  ]);
});

test('parser', (t) => {
  t.deepEqual(parser(tokenizer('1 === 2')), {
    type: astTypes.PROGRAM,
    body: [
      {
        type: astTypes.EXPRESSION_STATEMENT,
        expression: {
          type: astTypes.BINARY_EXPRESSION,
          operator: '===',
          left: {
            type: astTypes.LITERAL,
            value: 1,
          },
          right: {
            type: astTypes.LITERAL,
            value: 2,
          },
        },
      },
    ],
  });
  t.deepEqual(parser(tokenizer('1 === 2 && 3 == 4')), {
    type: astTypes.PROGRAM,
    body: [
      {
        type: astTypes.EXPRESSION_STATEMENT,
        expression: {
          type: astTypes.LOGICAL_EXPRESSION,
          operator: '&&',
          left: {
            type: astTypes.BINARY_EXPRESSION,
            operator: '===',
            left: {
              type: astTypes.LITERAL,
              value: 1,
            },
            right: {
              type: astTypes.LITERAL,
              value: 2,
            },
          },
          right: {
            type: astTypes.BINARY_EXPRESSION,
            operator: '==',
            left: {
              type: astTypes.LITERAL,
              value: 3,
            },
            right: {
              type: astTypes.LITERAL,
              value: 4,
            },
          },
        },
      },
    ],
  });
  t.deepEqual(parser(tokenizer('1 === 2 && (3 == 4)')), {
    type: astTypes.PROGRAM,
    body: [
      {
        type: astTypes.EXPRESSION_STATEMENT,
        expression: {
          type: astTypes.LOGICAL_EXPRESSION,
          operator: '&&',
          left: {
            type: astTypes.BINARY_EXPRESSION,
            operator: '===',
            left: {
              type: astTypes.LITERAL,
              value: 1,
            },
            right: {
              type: astTypes.LITERAL,
              value: 2,
            },
          },
          right: {
            type: astTypes.BINARY_EXPRESSION,
            operator: '==',
            left: {
              type: astTypes.LITERAL,
              value: 3,
            },
            right: {
              type: astTypes.LITERAL,
              value: 4,
            },
          },
        },
      },
    ],
  });
});

test('execute', (t) => {
  t.deepEqual(compiler('(1 + 1) * ((2))'), 4);
  t.deepEqual(compiler('(1 + 1) * (2)'), 4);
  t.deepEqual(compiler('(1 + 1) * 2'), 4);
  t.deepEqual(compiler('void 0'), undefined);
  t.deepEqual(compiler('void(0)'), undefined);
  t.deepEqual(compiler('1, 2 === 1'), false);
  t.deepEqual(compiler('1, 2'), 2);
  t.deepEqual(compiler('true || true && false'), false);
  t.deepEqual(compiler('false && true || false && true'), false);
  t.deepEqual(compiler('true && false || !true'), false);
  t.deepEqual(compiler('3 ** 2 === 9'), true);
  t.deepEqual(compiler('3 % 2 === 1'), true);
  t.deepEqual(compiler('2 / 2 === 1'), true);
  t.deepEqual(compiler('2 * 2 === 4'), true);
  t.deepEqual(compiler('1 - 2 === -1'), true);
  t.deepEqual(compiler('1 + 2 === 3'), true);
  t.deepEqual(compiler('undefined === undefined'), true);
  t.deepEqual(compiler('undefined === {{test}}', {}), true);
  t.deepEqual(compiler('1 === undefined'), false);
  t.deepEqual(compiler('null === undefined'), false);
  t.deepEqual(compiler('null === null'), true);
  t.deepEqual(compiler('1 === -1 && (1 === 1)'), false);
  t.deepEqual(compiler('-1 === -1'), true);
  t.deepEqual(compiler('1.1 === 1.1'), true);
  t.deepEqual(compiler('1 === 1 && 1 === 2'), false);
  t.deepEqual(compiler('{{userGrade}} > 1', { userGrade: 1 }), false);
  t.deepEqual(compiler('{{userGrade}} >= 1', { userGrade: 1 }), true);
  t.deepEqual(compiler('{{userGrade}} >= 1 && {{userName}} === \'test\'', {
    userGrade: 1,
    userName: 'test',
  }), true);
});