import piexifjs from 'piexifjs';

interface GPSCoordinates {
  lat: number;
  lon: number;
}

interface VerifyResult {
  hasGPS: boolean;
  coordinates?: GPSCoordinates;
  allExif?: any;
}

export const verifyGPSInImage = (imageDataUrl: string): VerifyResult => {
  try {
    // console.log('🔍 Starting EXIF metadata extraction...');

    // 1️⃣ Validate input format
    if (!imageDataUrl.startsWith('data:image/jpeg;base64,')) {
      console.error('❌ Invalid input — expected a Base64 JPEG DataURL.');
      // console.log('Received data starts with:', imageDataUrl.slice(0, 40));
      return { hasGPS: false };
    }

    // 2️⃣ Load EXIF data
    const exifObj = piexifjs.load(imageDataUrl);
    // console.log('📸 All EXIF sections found:', Object.keys(exifObj));

    // 3️⃣ Print each section’s contents
    for (const [section, data] of Object.entries(exifObj)) {
      // console.log(`🔹 Section: ${section}`);
      // console.log(data);
    }

    // 4️⃣ Extract GPS info if present
    const gps = exifObj.GPS;
    if (!gps || Object.keys(gps).length === 0) {
      console.warn('⚠️ No GPS metadata found.');
      return { hasGPS: false, allExif: exifObj };
    }

    const lat = gps[piexifjs.GPSIFD.GPSLatitude];
    const lon = gps[piexifjs.GPSIFD.GPSLongitude];
    const latRef = gps[piexifjs.GPSIFD.GPSLatitudeRef];
    const lonRef = gps[piexifjs.GPSIFD.GPSLongitudeRef];

    // console.log('🧭 Raw GPS values:', { lat, lon, latRef, lonRef });

    if (!lat || !lon) {
      console.warn('⚠️ GPS coordinates missing or incomplete.');
      return { hasGPS: false, allExif: exifObj };
    }

    // 5️⃣ Convert DMS → Decimal degrees
    const convertToDecimal = (dms: number[][]) =>
      dms[0][0] / dms[0][1] +
      dms[1][0] / dms[1][1] / 60 +
      dms[2][0] / dms[2][1] / 3600;

    const latDecimal = convertToDecimal(lat) * (latRef === 'S' ? -1 : 1);
    const lonDecimal = convertToDecimal(lon) * (lonRef === 'W' ? -1 : 1);

    // console.log('✅ GPS coordinates (decimal):', {
    //   lat: latDecimal,
    //   lon: lonDecimal,
    // });

    return {
      hasGPS: true,
      coordinates: { lat: latDecimal, lon: lonDecimal },
      allExif: exifObj,
    };
  } catch (error) {
    console.error('💥 Error reading EXIF data:', error);
    return { hasGPS: false };
  }
};

export default verifyGPSInImage;

// import piexifjs from 'piexifjs';

// const verifyGPSInImage = (imageDataUrl: string): { hasGPS: boolean; coordinates?: { lat: number; lon: number } } => {
//   try {
//     const exifObj = piexifjs.load(imageDataUrl) as {
//       GPS?: { [key: number]: any }
//     };

//     if (
//       exifObj.GPS &&
//       exifObj.GPS[piexifjs.GPSIFD.GPSLatitude] &&
//       exifObj.GPS[piexifjs.GPSIFD.GPSLongitude]
//     ) {
//       const latRational = exifObj.GPS[piexifjs.GPSIFD.GPSLatitude];
//       const lonRational = exifObj.GPS[piexifjs.GPSIFD.GPSLongitude];
//       const latRef = exifObj.GPS[piexifjs.GPSIFD.GPSLatitudeRef];
//       const lonRef = exifObj.GPS[piexifjs.GPSIFD.GPSLongitudeRef];

//       // Convert rational to decimal
//       const latDecimal =
//         latRational[0][0] / latRational[0][1] +
//         latRational[1][0] / latRational[1][1] / 60 +
//         latRational[2][0] / latRational[2][1] / 3600;

//       const lonDecimal =
//         lonRational[0][0] / lonRational[0][1] +
//         lonRational[1][0] / lonRational[1][1] / 60 +
//         lonRational[2][0] / lonRational[2][1] / 3600;

//       return {
//         hasGPS: true,
//         coordinates: {
//           lat: latRef === 'S' ? -latDecimal : latDecimal,
//           lon: lonRef === 'W' ? -lonDecimal : lonDecimal,
//         },
//       };
//     }

//     return { hasGPS: false };
//   } catch (error) {
//     console.error('Error verifying GPS data:', error);
//     return { hasGPS: false };
//   }
// };

// export default verifyGPSInImage;