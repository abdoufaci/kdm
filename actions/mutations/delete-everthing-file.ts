"use server";

import axios from "axios";

export const deleteEverythingFile = async ({
  id,
  type,
}: {
  id: string;
  type: string;
}) => {
  try {
    if (!id || !type) {
      throw new Error("ID and type are required to delete a file.");
    }

    if (type !== "video") {
      const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
      const storageApiKey = process.env.BUNNY_STORAGE_API_KEY;
      const storageRegionHost = "storage.bunnycdn.com";

      const deleteUrl = `https://${storageRegionHost}/${storageZoneName}/${id}`;

      const response = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: storageApiKey, // This is the FTP & API Password from your Storage Zone
        },
      });

      if (response.status === 200) {
        return { success: true, fail: false };
      } else {
        return { success: false, fail: true };
      }
    } else {
      const streamLibraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
      const streamApiKey = process.env.BUNNY_STREAM_API_KEY;

      // Construct the full URL for deletion
      const deleteUrl = `https://video.bunnycdn.com/library/${streamLibraryId}/videos/${id}`;

      // Make the DELETE request to Bunny.net Stream API
      const response = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: streamApiKey, // This is your Stream API Key
        },
      });

      if (response.status === 200) {
        return { success: true, fail: false };
      } else {
        return { success: false, fail: true };
      }
    }
  } catch (error) {
    console.log({
      error,
    });
  }
};
