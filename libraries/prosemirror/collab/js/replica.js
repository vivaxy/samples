/**
 * @since 2021-05-19
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorView } from 'prosemirror-view';
import { Step } from 'prosemirror-transform';

import {
  MESSAGE_TYPE,
  MESSAGE_TYPE_EDIT_STEP,
  MESSAGE_TYPE_INIT,
  MESSAGE_TYPE_SYNC_DOC,
  MESSAGE_TYPE_SYNC_STEPS,
  createStateFromDoc,
  createStateFromSerializedDoc,
  createStateFromDOM,
} from './common';

export function init() {
  document.title = window.name;
  // event
  window.addEventListener('message', function (e) {
    if (e.data.type === MESSAGE_TYPE) {
      handleMessage(e.data.data);
    }
  });

  // editor
  let version = 0;
  let unsettledSteps = [];
  const state = createStateFromDOM(document.querySelector('#content'));
  let prevDoc = state.doc;

  const view = new EditorView(document.querySelector('#editor'), {
    state,
    dispatchTransaction(transaction) {
      prevDoc = view.state.doc;
      const newState = view.state.apply(transaction);
      view.updateState(newState);
      if (transaction.steps.length) {
        // selection change may cause transaction, but it should not sendMessage
        unsettledSteps = transaction.steps;
        prevDoc = state.doc;
        sendMessage({
          type: MESSAGE_TYPE_EDIT_STEP,
          version: version,
          steps: unsettledSteps.map((step) => step.toJSON()),
          clientID: window.name,
        });
      }
    },
  });

  // collab
  function handleMessage(data) {
    if (data.type === MESSAGE_TYPE_SYNC_DOC) {
      const newState = createStateFromSerializedDoc(data.serializedDoc);
      view.updateState(newState);
      version = data.version;
    }
    if (data.type === MESSAGE_TYPE_SYNC_STEPS) {
      // TODO: how to implement?
      // revert unsettled steps
      const invertedSteps = unsettledSteps
        .map(function (step) {
          return step.invert(prevDoc);
        })
        .reverse();
      let newDoc = view.state.doc;
      invertedSteps.forEach(function (step) {
        newDoc = step.apply(newDoc).doc;
      });

      // play sync steps
      data.steps
        .map(function (step) {
          return Step.fromJSON(schema, step);
        })
        .forEach(function (step) {
          newDoc = step.apply(newDoc).doc;
        });

      const newState = createStateFromDoc(newDoc);
      view.updateState(newState);
      version = data.version;
    }
  }

  function sendMessage(data) {
    window.opener.postMessage(
      {
        type: MESSAGE_TYPE,
        data,
      },
      location.origin,
    );
  }

  // init
  sendMessage({
    type: MESSAGE_TYPE_INIT,
  });
}