/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {import("./event_utils.js").EventBus} EventBus */

import { AnnotationEditorParamsType } from "pdfjs-lib";

/**
 * @typedef {Object} AnnotationEditorParamsOptions
 * @property {HTMLInputElement} editorFreeTextFontSize
 * @property {HTMLInputElement} editorFreeTextColor
 * @property {HTMLInputElement} editorInkColor
 * @property {HTMLInputElement} editorInkThickness
 * @property {HTMLInputElement} editorInkOpacity
 * @property {HTMLButtonElement} editorStampAddImage
 * @property {HTMLInputElement} editorFreeHighlightThickness
 * @property {HTMLButtonElement} editorHighlightShowAll
 */

class AnnotationEditorParams {
  /**
   * @param {AnnotationEditorParamsOptions} options
   * @param {EventBus} eventBus
   * @param {AbortSignal} [abortSignal] - The AbortSignal for the window events.
   */
  constructor(options, eventBus, abortSignal) {
    this.eventBus = eventBus;
    this.#bindListeners(options, abortSignal);
  }

  /**
   * @param {AnnotationEditorParamsOptions} options
   */
  #bindListeners(
    {
      editorFreeTextFontSize,
      editorFreeTextColor,
      editorInkColor,
      editorInkThickness,
      editorInkOpacity,
      editorStampAddImage,
      editorFreeHighlightThickness,
      editorHighlightShowAll,
    },
    abortSignal
  ) {
    const eventOpts = { signal: abortSignal };

    const dispatchEvent = (typeStr, value) => {
      this.eventBus.dispatch("switchannotationeditorparams", {
        source: this,
        type: AnnotationEditorParamsType[typeStr],
        value,
      });
    };
    editorFreeTextFontSize.addEventListener(
      "input",
      function () {
        dispatchEvent("FREETEXT_SIZE", this.valueAsNumber);
      },
      eventOpts
    );
    editorFreeTextColor.addEventListener(
      "input",
      function () {
        dispatchEvent("FREETEXT_COLOR", this.value);
      },
      eventOpts
    );
    editorInkColor.addEventListener(
      "input",
      function () {
        dispatchEvent("INK_COLOR", this.value);
      },
      eventOpts
    );
    editorInkThickness.addEventListener(
      "input",
      function () {
        dispatchEvent("INK_THICKNESS", this.valueAsNumber);
      },
      eventOpts
    );
    editorInkOpacity.addEventListener(
      "input",
      function () {
        dispatchEvent("INK_OPACITY", this.valueAsNumber);
      },
      eventOpts
    );
    editorStampAddImage.addEventListener(
      "click",
      () => {
        dispatchEvent("CREATE");
      },
      eventOpts
    );
    editorFreeHighlightThickness.addEventListener(
      "input",
      function () {
        dispatchEvent("HIGHLIGHT_THICKNESS", this.valueAsNumber);
      },
      eventOpts
    );
    editorHighlightShowAll.addEventListener(
      "click",
      function () {
        const checked = this.getAttribute("aria-pressed") === "true";
        this.setAttribute("aria-pressed", !checked);
        dispatchEvent("HIGHLIGHT_SHOW_ALL", !checked);
      },
      eventOpts
    );

    this.eventBus._on(
      "annotationeditorparamschanged",
      evt => {
        for (const [type, value] of evt.details) {
          switch (type) {
            case AnnotationEditorParamsType.FREETEXT_SIZE:
              editorFreeTextFontSize.value = value;
              break;
            case AnnotationEditorParamsType.FREETEXT_COLOR:
              editorFreeTextColor.value = value;
              break;
            case AnnotationEditorParamsType.INK_COLOR:
              editorInkColor.value = value;
              break;
            case AnnotationEditorParamsType.INK_THICKNESS:
              editorInkThickness.value = value;
              break;
            case AnnotationEditorParamsType.INK_OPACITY:
              editorInkOpacity.value = value;
              break;
            case AnnotationEditorParamsType.HIGHLIGHT_THICKNESS:
              editorFreeHighlightThickness.value = value;
              break;
            case AnnotationEditorParamsType.HIGHLIGHT_FREE:
              editorFreeHighlightThickness.disabled = !value;
              break;
            case AnnotationEditorParamsType.HIGHLIGHT_SHOW_ALL:
              editorHighlightShowAll.setAttribute("aria-pressed", value);
              break;
          }
        }
      },
      eventOpts
    );
  }
}

export { AnnotationEditorParams };
