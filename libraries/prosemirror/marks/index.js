/**
 * @since 2021-04-13 10:27
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { AddMarkStep } from 'prosemirror-transform';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import applyDevTools from 'prosemirror-dev-tools';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const sampleSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: {
    strong: {
      attrs: {
        'data-id': { default: 0 },
      },
      parseDOM: [
        {
          tag: 'strong',
          getAttrs(node) {
            return {
              'data-id': node.getAttribute('data-id'),
            };
          },
        },
      ],
      toDOM(node) {
        const attrs = {
          'data-id': node.attrs['data-id'] || Date.now(),
        };
        return ['strong', attrs, 0];
      },
    },
    background: {
      excludes: '',
      attrs: {
        'data-background-id': { default: 0 },
      },
      parseDOM: [
        {
          tag: '[data-background-id]',
          getAttrs(node) {
            return {
              'data-background-id': node.getAttribute('data-background-id'),
            };
          },
        },
      ],
      toDOM(node) {
        const attrs = {
          'data-background-id': node.attrs['data-background-id'] || Date.now(),
          style: 'background-color: rgba(255, 255, 0, 0.1)',
        };
        return ['span', attrs, 0];
      },
    },
  },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(sampleSchema).parse(
      document.querySelector('#content'),
    ),
    plugins: exampleSetup({ schema: sampleSchema }),
  }),
});

applyDevTools(view);

const $markStart = document.querySelector('#mark-start');
const $markEnd = document.querySelector('#mark-end');

document.querySelector('#add-mark').addEventListener('click', function () {
  const from = $markStart.value;
  const to = $markEnd.value;
  const mark = sampleSchema.marks.background.create({
    'data-background-id': 'b-' + Date.now(),
  });
  view.dispatch(view.state.tr.addMark(from, to, mark));
});

document
  .querySelector('#add-mark-by-step')
  .addEventListener('click', function () {
    const from = $markStart.value;
    const to = $markEnd.value;
    const mark = sampleSchema.marks.background.create({
      'data-background-id': 'b-' + Date.now(),
    });
    const { tr } = view.state;
    tr.maybeStep(new AddMarkStep(Number(from), Number(to), mark));
    view.dispatch(tr);
  });

document.querySelector('#remove-mark').addEventListener('click', function () {
  const from = $markStart.value;
  const to = $markEnd.value;
  view.dispatch(
    view.state.tr.removeMark(from, to, sampleSchema.marks.background),
  );
});

window.view = view;
