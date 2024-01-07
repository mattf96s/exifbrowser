function ConvertDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: "N" | "S" | "E" | "W"
) {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    dd *= -1;
  }
  return dd;
}

type LatitudeRefValue = "N" | "S";
type LongitudeRefValue = "E" | "W";
/**
 * There are 3 possible formats for storing GPS coordinates in EXIF:
 *
 * @param exif
 */
export const parseCoordinates = (exif: ExifReader.Tags) => {
  let latitudeRaw = exif.GPSLatitude;
  let latitudeRefRaw = exif.GPSLatitudeRef;

  let longitudeRaw = exif.GPSLongitude;
  let longitudeRefRaw = exif.GPSLongitudeRef;

  let latitude: number | null = null;
  let latitudeRef: LatitudeRefValue | null = null;

  let longitude: number | null = null;
  let longitudeRef: LongitudeRefValue | null = null;

  if (latitudeRefRaw && latitudeRefRaw.value) {
    const value = latitudeRefRaw.value;
    if (typeof value === "string" && ["N", "S"].includes(value)) {
      latitudeRef = value as LatitudeRefValue;
    } else if (typeof value === "number" && [0, 1].includes(value)) {
      latitudeRef = value === 0 ? "N" : "S";
    } else if (Array.isArray(value)) {
      const [ref] = value;
      if (typeof ref === "string" && ["N", "S"].includes(ref)) {
        latitudeRef = ref as LatitudeRefValue;
      } else if (typeof ref === "number" && [0, 1].includes(ref)) {
        latitudeRef = ref === 0 ? "N" : "S";
      }
    }
  }

  if (latitudeRef === null) return [null, null];

  if (longitudeRefRaw && longitudeRefRaw.value) {
    const value = longitudeRefRaw.value;
    if (typeof value === "string" && ["E", "W"].includes(value)) {
      longitudeRef = value as LongitudeRefValue;
    } else if (typeof value === "number" && [0, 1].includes(value)) {
      longitudeRef = value === 0 ? "E" : "W";
    } else if (Array.isArray(value)) {
      const [ref] = value;
      if (typeof ref === "string" && ["E", "W"].includes(ref)) {
        longitudeRef = ref as LongitudeRefValue;
      } else if (typeof ref === "number" && [0, 1].includes(ref)) {
        longitudeRef = ref === 0 ? "E" : "W";
      }
    }
  }

  if (longitudeRef === null) return [null, null];

  if (latitudeRaw && latitudeRaw.value) {
    const value = latitudeRaw.value;
    if (typeof value === "string") {
      latitude = parseFloat(value);
    } else if (typeof value === "number") {
      latitude = value;
    } else if (Array.isArray(value)) {
      const [degrees, minutes, seconds] = value;
      if (
        typeof degrees === "number" &&
        typeof minutes === "number" &&
        typeof seconds === "number"
      ) {
        latitude = ConvertDMSToDD(degrees, minutes, seconds, latitudeRef);
      }
    }
  }

  if (latitude === null) return [null, null];

  if (longitudeRaw && longitudeRaw.value) {
    const value = longitudeRaw.value;
    if (typeof value === "string") {
      longitude = parseFloat(value);
    } else if (typeof value === "number") {
      longitude = value;
    } else if (Array.isArray(value)) {
      const [degrees, minutes, seconds] = value;
      if (
        typeof degrees === "number" &&
        typeof minutes === "number" &&
        typeof seconds === "number"
      ) {
        longitude = ConvertDMSToDD(degrees, minutes, seconds, longitudeRef);
      }
    }
  }

  if (longitude === null) return [null, null];

  return [latitude, longitude];
};
