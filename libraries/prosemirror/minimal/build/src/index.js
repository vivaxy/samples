/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from '../_snowpack/pkg/prosemirror-schema-basic.js';
import { EditorState } from '../_snowpack/pkg/prosemirror-state.js';
import { EditorView } from '../_snowpack/pkg/prosemirror-view.js';

let state = EditorState.create({ schema });
let view = new EditorView(document.getElementById('editor'), {
  state,
});