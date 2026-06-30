import type { GeoInfo } from "src/types";

export const extractEXIFData = (file: File): Promise<GeoInfo | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const dataView = new DataView(arrayBuffer);
      
      let offset = 2;
      const maxOffset = Math.min(65535, dataView.byteLength)-4;
      
      while (offset < maxOffset) {
        const marker = dataView.getUint16(offset);
        if (marker === 0xFFE1) {
          const length = dataView.getUint16(offset + 2);
          const exifData = arrayBuffer.slice(offset + 4, offset + 4 + length - 2);
          resolve(parseEXIFForGPS(new DataView(exifData)));
          return;
        }
        offset += 2 + dataView.getUint16(offset + 2);
      }
      resolve(null);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

export const parseEXIFForGPS = (dataView: DataView): GeoInfo | null => {
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
    console.error("Error parsing EXIF:", error);
    return null;
  }
};

export const findGPSIFD = (dataView: DataView, ifdOffset: number, isLittleEndian: boolean): GeoInfo | null => {
  try {
    const numEntries = isLittleEndian 
      ? dataView.getUint16(ifdOffset, true)
      : dataView.getUint16(ifdOffset, false);
    
    let currentOffset = ifdOffset + 2;
    
    for (let i = 0; i < numEntries; i++) {
      const tag = isLittleEndian 
        ? dataView.getUint16(currentOffset, true)
        : dataView.getUint16(currentOffset, false);
      
      if (tag === 0x8825) {
        const gpsOffset = isLittleEndian 
          ? dataView.getUint32(currentOffset + 8, true)
          : dataView.getUint32(currentOffset + 8, false);
        
        return parseGPSData(dataView, ifdOffset - 4 + gpsOffset, isLittleEndian);
      }
      currentOffset += 12;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const parseGPSData = (dataView: DataView, gpsOffset: number, isLittleEndian: boolean): GeoInfo | null => {
  try {
    const gpsEntries = isLittleEndian 
      ? dataView.getUint16(gpsOffset, true)
      : dataView.getUint16(gpsOffset, false);
    
    let latRef = null, lonRef = null;
    let currentOffset = gpsOffset + 2;
    
    for (let i = 0; i < gpsEntries; i++) {
      const tag = isLittleEndian 
        ? dataView.getUint16(currentOffset, true)
        : dataView.getUint16(currentOffset, false);
      
      if (tag === 1) latRef = String.fromCharCode(dataView.getUint8(currentOffset + 8));
      if (tag === 3) lonRef = String.fromCharCode(dataView.getUint8(currentOffset + 8));
      
      currentOffset += 12;
    }
    
    if (latRef && lonRef) {
      return { hasGPS: true, latRef, lonRef };
    }
    return null;
  } catch (error) {
    return null;
  }
};