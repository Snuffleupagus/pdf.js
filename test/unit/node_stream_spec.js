/* Copyright 2017 Mozilla Foundation
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

import { AbortException, isNodeJS } from "../../src/shared/util.js";
import { PDFNodeStream } from "../../src/display/node_stream.js";

// Ensure that these tests only run in Node.js environments.
if (!isNodeJS) {
  throw new Error(
    'The "node_stream" unit-tests can only be run in Node.js environments.'
  );
}

describe("node_stream", function () {
  const url = process.getBuiltinModule("url");
  const cwdURL = url.pathToFileURL(process.cwd()) + "/";
  const pdf = new URL("./test/pdfs/tracemonkey.pdf", cwdURL).href;
  const pdfLength = 1016315;

  it("read filesystem pdf files", async function () {
    const stream2 = new PDFNodeStream({
      url: pdf,
      rangeChunkSize: 65536,
      disableStream: true,
      disableRange: true,
    });

    const fullReader2 = stream2.getFullReader();

    let isStreamingSupported2, isRangeSupported2;
    const promise2 = fullReader2.headersReady.then(() => {
      isStreamingSupported2 = fullReader2.isStreamingSupported;
      isRangeSupported2 = fullReader2.isRangeSupported;
    });

    let len2 = 0;
    const read2 = function () {
      return fullReader2.read().then(function (result) {
        if (result.done) {
          return undefined;
        }
        len2 += result.value.byteLength;
        return read2();
      });
    };

    await Promise.all([read2(), promise2]);

    expect(isStreamingSupported2).toEqual(false);
    expect(isRangeSupported2).toEqual(false);
    expect(len2).toEqual(pdfLength);
  });

  it("read custom ranges for filesystem urls", async function () {
    const rangeSize = 32768;
    const stream2 = new PDFNodeStream({
      url: pdf,
      length: pdfLength,
      rangeChunkSize: rangeSize,
      disableStream: true,
      disableRange: false,
    });

    const fullReader2 = stream2.getFullReader();

    let isStreamingSupported2, isRangeSupported2, fullReaderCancelled2;
    const promise2 = fullReader2.headersReady.then(function () {
      isStreamingSupported2 = fullReader2.isStreamingSupported;
      isRangeSupported2 = fullReader2.isRangeSupported;
      // we shall be able to close the full reader without issues
      fullReader2.cancel(new AbortException("Don't need fullReader2."));
      fullReaderCancelled2 = true;
    });

    // Skipping fullReader results, requesting something from the PDF end.
    const tailSize = pdfLength % rangeSize || rangeSize;

    const range21Reader = stream2.getRangeReader(
      pdfLength - tailSize - rangeSize,
      pdfLength - tailSize
    );
    const range22Reader = stream2.getRangeReader(
      pdfLength - tailSize,
      pdfLength
    );

    const result21 = { value: 0 },
      result22 = { value: 0 };
    const read = function (reader, lenResult) {
      return reader.read().then(function (result) {
        if (result.done) {
          return undefined;
        }
        lenResult.value += result.value.byteLength;
        return read(reader, lenResult);
      });
    };

    await Promise.all([
      read(range21Reader, result21),
      read(range22Reader, result22),
      promise2,
    ]);

    expect(result21.value).toEqual(rangeSize);
    expect(result22.value).toEqual(tailSize);
    expect(isStreamingSupported2).toEqual(false);
    expect(isRangeSupported2).toEqual(true);
    expect(fullReaderCancelled2).toEqual(true);
  });
});
