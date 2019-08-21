import { decodeWixInstance } from './decode-wix-instance';

export function createInstanceAdapter(wixInstance): WixInstanceAdapter {
  const decodedInstance = decodeWixInstance({ instance: wixInstance });
  return new WixInstanceAdapter(decodedInstance);
}

export class WixInstanceAdapter {
  constructor(private readonly decodedInstance: any) {}
  public getBusinessId(): string {
    return this.decodedInstance.instanceId;
  }
  public isOwner(): boolean {
    return this.getSiteOwnerId() === this.getUserId();
  }

  public getSiteOwnerId(): string {
    return this.decodedInstance.siteOwnerId;
  }

  public getPermissions(): any {
    return this.decodedInstance.permissions;
  }

  public getUserId(): string {
    return this.decodedInstance.uid;
  }
  public getVendorProductId(): string {
    return this.decodedInstance.vendorProductId;
  }
  public getMetaSiteId(): string {
    return this.decodedInstance.metaSiteId;
  }
}
