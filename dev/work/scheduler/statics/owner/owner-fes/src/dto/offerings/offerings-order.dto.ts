export interface CategoryOrderDto {
  id: string;
  order: number;
  offerings: OfferingOrderDto[];
}

export interface OfferingOrderDto {
  id: string;
  order: number;
}

export interface OfferingsOrderDto {
  categories: CategoryOrderDto[];
}
