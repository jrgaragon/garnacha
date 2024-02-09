const express = require("express");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const fs = require("fs/promises");
const fss = require("fs");

const app = express();
const port = 3000;

const CATALOG_URL = "https://a.4cdn.org/{{BOARD}}/catalog.json";
const THREAD_URL = "https://a.4cdn.org/{{BOARD}}/thread/{{THREAD}}.json";
const THUMBNAIL_URL = "https://i.4cdn.org/{{BOARD}}/{{THUMBNAIL}}s.jpg";
const MEDIA_URL = "https://i.4cdn.org/{{BOARD}}/{{MEDIA}}{{EXT}}";
//03_thumbnails

app.get("/", (request, response) => {
  response.send("4Chan");
});

app.get("/media/video/:media", async (request, response) => {
  const mediaParam = request.params["media"];
  const mediaURL = decodeURIComponent(mediaParam);

  const mediaResult = await fetch(mediaURL);
  const buffer = await mediaResult.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer);

  fss.writeFile("video.webm", stringifiedBuffer, () => {
    console.log("done");
  });

  console.log(`Video - ${mediaURL}`);
  response.json({ ok: true });
});

app.get("/media/video", (req, res) => {
  const options = {};
  const filePath = "video.webm";
  let start;
  let end;

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/webm");

  fss.stat(filePath, (err, stat) => {
    if (err) {
      console.error(`File stat error for ${filePath}.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    let contentLength = stat.size;

    if (req.method === "HEAD") {
      res.statusCode = 200;
      res.setHeader("accept-ranges", "bytes");
      res.setHeader("content-length", contentLength);
      console.log("NOT Streaming");
      res.end();
    } else {
      let retrievedLength;
      if (start !== undefined && end !== undefined) {
        retrievedLength = end + 1 - start;
      } else if (start !== undefined) {
        retrievedLength = contentLength - start;
      } else if (end !== undefined) {
        retrievedLength = end + 1;
      } else {
        retrievedLength = contentLength;
      }

      res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

      res.setHeader("content-length", retrievedLength);
      res.setHeader("Content-Type", "video/mp4");

      if (range !== undefined) {
        res.setHeader(
          "content-range",
          `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
        );
        res.setHeader("accept-ranges", "bytes");
      }

      const fileStream = fss.createReadStream(filePath, options);
      fileStream.on("error", (error) => {
        console.log(`Error reading file ${filePath}.`);
        console.log(error);
        res.sendStatus(500);
      });
      console.log("streaming");
      fileStream.pipe(res);
    }
  });
});

//get image
app.get("/media/:media", async (request, response) => {
  const mediaParam = request.params["media"];
  let result = {};

  if (mediaParam) {
    console.log(mediaParam);
    const mediaURL = decodeURIComponent(mediaParam);

    try {
      const mediaResult = await fetch(mediaURL);
      const buffer = await mediaResult.arrayBuffer();
      const stringifiedBuffer = Buffer.from(buffer).toString("base64");
      const contentType = mediaResult.headers.get("content-type");
      const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

      result = { media: imageBase64 ?? "" };
    } catch (e) {
      console.log({ s: "/media/:media", e });
    }
  }

  response.setHeader("Content-Type", "application/json");
  response.json(result);
});

app.get("/catalog/:board/:page", async (request, response) => {
  const board = request.params["board"];
  const page = Number(request.params["page"]);

  const catalogUrl = CATALOG_URL.replace("{{BOARD}}", board);
  console.log({ board, page, catalogUrl });

  const catalogResult = await fetch(catalogUrl, { method: "GET" });
  const catalogObject = await catalogResult.json();

  const threads = catalogObject.find((p) => p.page === page).threads;

  threads.map((t) => {
    if (t.ext) {
      t.media = MEDIA_URL.replace("{{BOARD}}", board)
        .replace("{{MEDIA}}", t.tim)
        .replace("{{EXT}}", t.ext);

      if (t.ext === ".webm") {
        t.thumbnailUrl = THUMBNAIL_URL.replace("{{BOARD}}", board)
          .replace("{{THUMBNAIL}}", t.tim)
          .replace("{{EXT}}", ".jpg");
        t.isVideo = true;
      } else {
        t.thumbnailUrl = THUMBNAIL_URL.replace("{{BOARD}}", board).replace(
          "{{THUMBNAIL}}",
          t.tim
        );
        t.isVideo = false;
      }

      t.hasMedia = true;
    } else {
      t.hasMedia = false;
    }

    return t;
  });

  const promises = [];

  for (let p of threads.filter((t) => t.thumbnailUrl)) {
    promises.push(getThumbnail(p));
  }

  await Promise.all(promises);

  response.setHeader("Content-Type", "application/json");
  response.json(threads);
});

const getThumbnail = async (post) => {
  const retry = 3;

  for (let i = 0; i < retry; i++) {
    try {
      const thumbnailResult = await fetch(post.thumbnailUrl);
      const buffer = await thumbnailResult.arrayBuffer();
      const stringifiedBuffer = Buffer.from(buffer).toString("base64");
      const contentType = thumbnailResult.headers.get("content-type");
      const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

      post.thumbnail = imageBase64;

      break;
    } catch (error) {
      console.log({ url: port.thumbnailUrl });
      console.log(error);
    }
  }
};

app.get("/thread/:board/:thread", async (request, response) => {
  const board = request.params["board"];
  const thread = request.params["thread"];

  const threadUrl = THREAD_URL.replace("{{BOARD}}", board).replace(
    "{{THREAD}}",
    thread
  );

  console.log({ threadUrl });

  const threadResult = await fetch(threadUrl, { method: "GET" });
  const threadObject = await threadResult.json();

  threadObject.posts.map((t) => {
    if (t.ext) {
      t.media = MEDIA_URL.replace("{{BOARD}}", board)
        .replace("{{MEDIA}}", t.tim)
        .replace("{{EXT}}", t.ext);

      if (t.ext === ".webm") {
        t.thumbnailUrl = THUMBNAIL_URL.replace("{{BOARD}}", board)
          .replace("{{THUMBNAIL}}", t.tim)
          .replace("{{EXT}}", ".jpg");
        t.isVideo = true;
      } else {
        t.thumbnailUrl = THUMBNAIL_URL.replace("{{BOARD}}", board)
          .replace("{{THUMBNAIL}}", t.tim)
          .replace("{{EXT}}", t.ext);
        t.isVideo = false;
      }

      t.hasMedia = true;
    } else {
      t.hasMedia = false;
    }

    return t;
  });

  const promises = [];

  for (let p of threadObject.posts.filter((t) => t.thumbnailUrl)) {
    promises.push(getThumbnail(p));
  }

  await Promise.all(promises);

  response.setHeader("Content-Type", "application/json");
  response.json(threadObject);
});

app.get("/board", async (request, response) => {
  const boardResult = await fetch("https://a.4cdn.org/boards.json");
  const boardObject = await boardResult.json();

  response.setHeader("Content-Type", "application/json");
  response.json(boardObject);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
