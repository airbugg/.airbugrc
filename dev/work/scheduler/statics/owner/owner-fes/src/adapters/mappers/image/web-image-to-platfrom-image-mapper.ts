import { Image } from '@wix/ambassador-resources-server/rpc';

export function mapWebImageToPlatformImage(
  // image: WebImage | OfferingImage, // todo <- why does it not working ?
  image: any,
): Image {
  return {
    width: image.width,
    height: image.height,
    url: image.relativeUri,
    id: image.filename || image.fileName,
  };
}
