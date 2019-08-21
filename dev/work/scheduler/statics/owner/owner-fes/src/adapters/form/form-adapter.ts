import { DynamicFormData } from '../../dto/form.dto';
import {
  GetFormResponse,
  UpdateFormResponse,
} from '@wix/ambassador-services-server';
import { mapFormDTOToForm } from '../mappers/form/platform-form-to-web-form-mapper';
import { Form } from '@wix/ambassador-services-catalog-server/rpc';
import { mapWebFromToPlatformForm } from '../mappers/form/web-form-to-platform-mapper';

export async function getBookingForm(
  getterOfBookingForm: () => Promise<GetFormResponse>,
): Promise<DynamicFormData> {
  const getFormResponse: GetFormResponse = await getterOfBookingForm();
  const form = mapFormDTOToForm(getFormResponse.form);
  return form;
}

export async function updateBookingForm(
  webFrom: DynamicFormData,
  updaterOfBookingForm: (form: Form) => Promise<UpdateFormResponse>,
): Promise<any> {
  const form = mapWebFromToPlatformForm(webFrom);
  const response = await updaterOfBookingForm(form);
  return response.form.id;
}
