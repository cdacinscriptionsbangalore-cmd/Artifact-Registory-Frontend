import type { GeoInfo } from "../../types/types";
import findGPSIFD from "./findGPSIFD";

const parseEXIFForGPS = (dataView: DataView): GeoInfo | null => {
  try {
    const exifHeader = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );
    
    if (exifHeader !== "Exif") return null;
    
    const offset = 6;
    const byteOrder = dataView.getUint16(offset);
    const isLittleEndian = byteOrder === 0x4949;
    
    const ifd0Offset = isLittleEndian 
      ? dataView.getUint32(offset + 4, true)
      : dataView.getUint32(offset + 4, false);
    
    return findGPSIFD(dataView, offset + ifd0Offset, isLittleEndian);
  } catch (error) {
    console.error('Error parsing EXIF for GPS:', error);
    return null;
  }
};

export default parseEXIFForGPS;