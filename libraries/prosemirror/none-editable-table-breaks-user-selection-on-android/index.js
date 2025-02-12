/**
 * @since 2021-04-06 17:13
 * @author vivaxy
 */
import { schema as baseSchema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import { DOMParser, Schema } from 'https://cdn.skypack.dev/prosemirror-model';

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append({
    table: {
      content: 'table_row+',
      group: 'block',
      isolating: true,
      parseDOM: [
        {
          tag: 'table',
        },
      ],
      toDOM() {
        return [
          'div',
          {
            contenteditable: false,
          },
          ['table', ['tbody', 0]],
        ];
      },
    },
    table_row: {
      content: 'table_cell*',
      parseDOM: [
        {
          tag: 'tr',
        },
      ],
      toDOM() {
        return ['tr', 0];
      },
    },
    table_cell: {
      content: 'block+',
      parseDOM: [
        {
          tag: 'td',
        },
      ],
      toDOM() {
        return ['td', 0];
      },
    },
  }),
  marks: baseSchema.spec.marks,
});

const initialContent = DOMParser.fromSchema(schema).parse(
  document.querySelector('#initial-content'),
);

const state = EditorState.create({ doc: initialContent });
const view = new EditorView(document.querySelector('#editor'), { state });
