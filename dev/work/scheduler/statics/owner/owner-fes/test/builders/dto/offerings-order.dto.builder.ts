import { Chance } from 'chance';
import {
  OfferingsOrderDto,
  CategoryOrderDto,
  OfferingOrderDto,
} from '../../../src/dto/offerings/offerings-order.dto';

const chance = Chance();

export function validOfferingsOrder(): OfferingsOrderDto {
  let order = 0;
  return {
    categories: [
      new CategoryOrderDtoBuilder()
        .withOrder(0)
        .withOfferings([
          new OfferingOrderDtoBuilder().withOrder(order++).build(),
          new OfferingOrderDtoBuilder().withOrder(order++).build(),
          new OfferingOrderDtoBuilder().withOrder(order).build(),
        ])
        .build(),
      new CategoryOrderDtoBuilder()
        .withOrder(1)
        .withOfferings([
          new OfferingOrderDtoBuilder().withOrder(order++).build(),
          new OfferingOrderDtoBuilder().withOrder(order++).build(),
          new OfferingOrderDtoBuilder().withOrder(order).build(),
        ])
        .build(),
    ],
  };
}

function validCategoryOrder(): CategoryOrderDto {
  return {
    id: chance.guid(),
    order: 0,
    offerings: [],
  };
}

function validOfferingOrder(): OfferingOrderDto {
  return {
    id: chance.guid(),
    order: 0,
  };
}

export class OfferingsOrderDtoBuilder {
  offeringsOrder: OfferingsOrderDto = { ...validOfferingsOrder() };

  withCategories(categories: CategoryOrderDto[]) {
    this.offeringsOrder.categories = categories;
    return this;
  }

  build() {
    return this.offeringsOrder;
  }
}

export class CategoryOrderDtoBuilder {
  categoryOrder: CategoryOrderDto = { ...validCategoryOrder() };

  withId(id: string) {
    this.categoryOrder.id = id;
    return this;
  }

  withOrder(order: number) {
    this.categoryOrder.order = order;
    return this;
  }

  withOfferings(offerings: OfferingOrderDto[]) {
    this.categoryOrder.offerings = offerings;
    return this;
  }

  build() {
    return this.categoryOrder;
  }
}

export class OfferingOrderDtoBuilder {
  offeringOrder: OfferingOrderDto = { ...validOfferingOrder() };

  withId(id: string) {
    this.offeringOrder.id = id;
    return this;
  }

  withOrder(order: number) {
    this.offeringOrder.order = order;
    return this;
  }

  build() {
    return this.offeringOrder;
  }
}
