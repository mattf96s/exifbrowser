/**
 * Note the DomParser.
 */
export async function parseGpxFile(event: InputEvent) {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const xmlEntries: XMLDocument[] = [];

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(reader.result as string, "text/xml");
      xmlEntries.push(xml);
    };
    reader.readAsText(file);
  }

  return xmlEntries;
}

export interface GpxFormProps {
  onChange: (gpxPoints: GpxPoint[]) => void;
}

export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
  time: Date;
}

interface GpxRawPoint {
  lat: string;
  lon: string;
  ele: number;
  time: string;
}

// https://github.com/aqum/gpx-image-geotag/blob/master/src/gpx-form/gpx-form.component.tsx
// Also see https://github.com/aqum/gpx-image-geotag/blob/master/src/geotag-download/geotag-download.component.tsx
// export class GpxForm extends Component<GpxFormProps> {
//   constructor(props) {
//     super(props);

//     this.handleFileChange = this.handleFileChange.bind(this);
//   }

//   async handleFileChange(event: ChangeEvent<HTMLInputElement>) {
//     const files = event.target.files;
//     if (!files || !files[0]) {
//       this.props.onChange([]);
//       return;
//     }

//     const points = await GpxForm.convertFileToGpxPoints(files[0]);
//     this.props.onChange(points);
//   }

//   static convertFileToGpxPoints(file: File): Promise<GpxPoint[]> {
//     const reader = new FileReader();

//     return new Promise((resolve, reject) => {
//       reader.onload = event => {
//         const result = event.target && event.target['result'];
//         if (!result) {
//           reject('convertFileToGpxPoints: empty file');
//         }

//         const jsonObj = xmlParser.parse(reader.result as string, {
//           attributeNamePrefix: '',
//           ignoreAttributes: false
//         });

//         const rawPoints = jsonObj.gpx.trk.trkseg.trkpt as GpxRawPoint[];
//         const points = rawPoints.map(rawPoint => ({
//           lat: parseFloat(rawPoint.lat),
//           lon: parseFloat(rawPoint.lon),
//           ele: rawPoint.ele,
//           time: new Date(rawPoint.time)
//         }));

//         resolve(points);
//       };

//       reader.onerror = () => reject('convertFileToGpxPoints: unknown error');
//       reader.onabort = () => reject('convertFileToGpxPoints: abort');

//       reader.readAsText(file);
//     });
//   }

//   render() {
//     return (
//       <form>
//         <input type="file" onChange={this.handleFileChange} accept=".gpx" />
//       </form>
//     );
//   }
// }

// https://github.com/aqum/gpx-image-geotag/blob/master/src/correlate-step/images-map/images-map.component.tsx
