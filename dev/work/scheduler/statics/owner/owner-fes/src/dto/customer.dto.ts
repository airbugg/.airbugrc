export interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: {
    city: string;
    street: string;
    zipCode: string;
  };
  birthday: null;
  note: null;
  additionalFields: any[];
}
