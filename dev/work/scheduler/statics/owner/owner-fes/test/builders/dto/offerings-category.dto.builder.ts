import { Chance } from 'chance';
import { CategoryDto } from '../../../src/dto/offerings/offerings-category.dto';

const chance = Chance();
function validCategory(): CategoryDto {
  return {
    id: chance.guid(),
    order: 0,
    name: 'category',
  };
}

export class CategoryDtoBuilder {
  category: CategoryDto = { ...validCategory() };

  withId(cid) {
    this.category.id = cid;
    return this;
  }

  withOrder(order) {
    this.category.order = order;
    return this;
  }

  withName(name) {
    this.category.name = name;
    return this;
  }

  build() {
    return this.category;
  }
}
