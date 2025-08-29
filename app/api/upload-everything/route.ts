import { NextResponse } from "next/server";
import { Readable, once } from "stream";
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { zone, file as File } from "@bunny.net/storage-sdk";

function requestToStream(req: Request): Readable {
  const reader = req.body?.getReader();
  return new Readable({
    async read() {
      if (!reader) return this.push(null);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        this.push(value);
      }
      this.push(null);
    },
  });
}

export async function POST(req: Request): Promise<Response> {
  const files: {
    tempPath: string;
    type: string;
    originalName: string;
    uniqueName: string;
  }[] = [];

  const busboy = Busboy({ headers: Object.fromEntries(req.headers) });

  const fileParsed = new Promise<void>((resolve, reject) => {
    busboy.on("file", (fieldname, file, { filename, mimeType }) => {
      if (!filename || !mimeType) return;

      const extension = path.extname(filename);
      const uniqueName = `${uuidv4()}${extension}`;
      const tempPath = path.join(os.tmpdir(), uniqueName);

      files.push({
        tempPath,
        type: mimeType.split("/")[0],
        originalName: filename,
        uniqueName,
      });

      const writeStream = fs.createWriteStream(tempPath);
      file.pipe(writeStream);
    });

    busboy.on("error", reject);
    busboy.on("finish", resolve);
  });

  requestToStream(req).pipe(busboy);
  await fileParsed;

  if (files.length === 0) {
    return NextResponse.json(
      { message: "No files uploaded." },
      { status: 400 }
    );
  }

  const uploaded = [];

  try {
    const storage = zone.connect_with_accesskey(
      //@ts-ignore
      "de",
      process.env.BUNNY_STORAGE_ZONE_NAME!,
      process.env.BUNNY_STORAGE_API_KEY!
    );

    for (const file of files) {
      const stream = fs.createReadStream(file.tempPath);

      if (file.type === "video") {
        const createRes = await axios.post(
          `https://video.bunnycdn.com/library/${process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID}/videos`,
          { title: file.originalName },
          {
            headers: {
              AccessKey: process.env.BUNNY_STREAM_API_KEY!,
              "Content-Type": "application/json",
            },
          }
        );

        const videoId = createRes.data.guid;

        await axios.put(
          `https://video.bunnycdn.com/library/${process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
          stream,
          {
            headers: {
              AccessKey: process.env.BUNNY_STREAM_API_KEY!,
              "Content-Type": "application/octet-stream",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        uploaded.push({ id: videoId, type: "video" });
      } else {
        const uploadPath = `/${file.uniqueName}`;
        //@ts-ignore
        await File.upload(storage, uploadPath, stream);
        uploaded.push({ id: file.uniqueName, type: file.type });
      }

      fs.unlink(file.tempPath, (err) => {
        if (err) console.error("Temp file cleanup failed:", err);
      });
    }

    return NextResponse.json({ files: uploaded }, { status: 200 });
  } catch (err: any) {
    console.error("Upload error:", err.response?.data || err.message);
    return NextResponse.json(
      {
        message: "Upload failed",
        error: err.response?.data || err.message,
      },
      { status: 500 }
    );
  }
}
