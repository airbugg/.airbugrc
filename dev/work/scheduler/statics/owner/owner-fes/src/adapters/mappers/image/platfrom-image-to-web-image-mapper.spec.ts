import {
  mapOfferingImage,
  mapWebImage,
} from './platfrom-image-to-web-image-mapper';
import { WebImage } from '../../../dto/Image.dto';
import { anImage } from '@wix/ambassador-services-server/builders';
import { OfferingImage } from '../../../dto/offerings/offering.dto';

describe('map image from', () => {
  it('map platform Image to we Image', () => {
    const aPlatformImage = anImage()
      .withHeight(100)
      .withWidth(200)
      .withUrl('jondon.png')
      .withId('id')
      .build();
    const webImag: WebImage = mapWebImage(aPlatformImage);
    expect(webImag.filename).toBe(aPlatformImage.id);
    expect(webImag.height).toBe(aPlatformImage.height);
    expect(webImag.width).toBe(aPlatformImage.width);
    expect(webImag.relativeUri).toBe(aPlatformImage.url);
  });
  it('should not break if url is not defined', () => {
    const aPlatformImage = anImage()
      .withHeight(100)
      .withWidth(200)
      .withUrl(undefined)
      .withId(undefined)
      .build();
    const webImag: OfferingImage = mapOfferingImage(aPlatformImage);
    expect(webImag.relativeUri).toBe('');
  });
});
