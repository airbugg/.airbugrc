import { Image } from '@wix/ambassador-resources-server/rpc';
import { WebImage } from '../../../dto/Image.dto';
import { OfferingImage } from '../../../dto/offerings/offering.dto';

export function mapImagesList(images: Image[]): WebImage {
  if (images && images.length && images.length > 0) {
    return mapWebImage(images[0]);
  }
  return null;
}

function mapBasicImage(resourceImage: Image): any {
  return {
    relativeUri: resourceImage.url,
    width: resourceImage.width,
    height: resourceImage.height,
    id: resourceImage.url,
  };
}

export function mapWebImage(resourceImage: Image): WebImage {
  if (resourceImage) {
    const webImage = mapBasicImage(resourceImage);
    webImage.filename = resourceImage.id;
    return webImage;
  }
  return null;
}

export function mapOfferingImage(resourceImage: Image): OfferingImage {
  if (resourceImage) {
    const offeringImage = mapBasicImage(resourceImage);
    offeringImage.fileName = resourceImage.url
      ? resourceImage.url.split('/').pop()
      : '';
    offeringImage.relativeUri = resourceImage.url
      ? resourceImage.url.split('/').pop()
      : '';
    return offeringImage;
  }
  return null;
}
