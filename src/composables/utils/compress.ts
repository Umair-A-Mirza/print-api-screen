import pako from "pako";
import Data from "../../types/db/data";

export const useCompress = () => {
    /**
     * Method to compress the data from the API to be added to FireStore DB.
     */
    const compress = (data: any) => {
        const jsonDataString = JSON.stringify(data);
        const compressedData = pako.deflate(jsonDataString);
        return Array.from(compressedData);
    };

    /**
     * Method to decompress the binary data from the FireStore DB to be used in the app (revert to JSON).
     * @param data
     * @returns
     */
    const decompress = (data: number[]): Data => {
        const compressedData = new Uint8Array(data);
        const decompressedString = pako.inflate(compressedData, {
            to: "string",
        });
        return JSON.parse(decompressedString);
    };

    return { compress, decompress };
};
