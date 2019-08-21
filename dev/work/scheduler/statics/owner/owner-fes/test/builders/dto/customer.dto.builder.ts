import { CustomerDto } from '../../../src/dto/customer.dto';

export class CustomerDtoBuilder {
  private readonly customer: CustomerDto = {
    id: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: {
      city: '',
      street: '',
      zipCode: '',
    },
    birthday: null,
    note: null,
    additionalFields: [],
  };

  public withId(id: string) {
    this.customer.id = id;
    return this;
  }

  withFirstName(firstName: string) {
    this.customer.firstName = firstName;
    return this;
  }

  withLastName(lastName: string) {
    this.customer.lastName = lastName;
    return this;
  }

  public build(): CustomerDto {
    return this.customer;
  }
}
