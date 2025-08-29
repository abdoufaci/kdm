"use server";

async function generateSHA256(video_id: string, expiry: number) {
  const data =
    process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID! +
    process.env.BUNNY_STREAM_API_KEY! +
    expiry +
    video_id;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export const createVideosInfos = async ({
  files,
}: {
  files: { fileName: string; fileType: string }[];
}) => {
  const uploadInfos = await Promise.all(
    files.map(async ({ fileName, fileType }) => {
      if (!fileName || !fileType) {
        throw new Error("fileName and fileType are required.");
      }

      const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
      const storageApiKey = process.env.BUNNY_STORAGE_API_KEY; // Your Storage Zone FTP & API Password
      const streamLibraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
      const streamApiKey = process.env.BUNNY_STREAM_API_KEY;
      const bunnyCdnHostname = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME; // e.g., easymoney.b-cdn.net

      if (
        !storageZoneName ||
        !storageApiKey ||
        !streamLibraryId ||
        !streamApiKey ||
        !bunnyCdnHostname
      ) {
        throw new Error(
          "Bunny.net credentials not fully configured on server."
        );
      }

      const createVideoResponse = await fetch(
        `https://video.bunnycdn.com/library/${streamLibraryId}/videos`,
        {
          method: "POST",
          headers: {
            AccessKey: streamApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: fileName }),
        }
      );

      if (!createVideoResponse.ok) {
        const errorData = await createVideoResponse.json();
        throw new Error(
          `Failed to create Bunny Stream video object: ${
            errorData.Message || createVideoResponse.statusText
          }`
        );
      }

      const videoData = await createVideoResponse.json();
      const videoId = videoData.guid;

      const expiry = Math.floor(Date.now() / 1000) + 60 * 60;

      // Provide TUS-specific upload information
      const uploadInfo: {
        type: string;
        tusUploadUrl: string;
        headers: {
          AuthorizationSignature: string;
          AuthorizationExpire: number;
          VideoId: any;
          LibraryId: string;
        };
        metadata: {
          filetype: string;
          title: string;
        };
        publicUrl: string;
        videoId: any;
      } = {
        type: "video",
        // The TUS endpoint for Bunny Stream
        tusUploadUrl: `https://video.bunnycdn.com/tusupload`,
        // Headers required by TUS for Bunny Stream
        headers: {
          AuthorizationSignature: await generateSHA256(videoId, expiry), // SHA256 signature (library_id + api_key + expiration_time + video_id)
          AuthorizationExpire: expiry, // Expiration time as in the signature,
          VideoId: videoId, // The guid of a previously created video object through the Create Video API call
          LibraryId: streamLibraryId,
        },
        metadata: {
          filetype: fileType,
          title: "My video",
        },
        publicUrl: `https://iframe.mediadelivery.net/embed/${streamLibraryId}/${videoId}`, // Embed URL
        videoId: videoId,
      };

      return uploadInfo;
    })
  );
  return uploadInfos;
};
