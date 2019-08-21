import {
  GetFormResponse,
  ServicesServer,
  UpdateFormRequest,
  UpdateFormResponse,
  Form,
} from '@wix/ambassador-services-server';

export function getBookingFormFactory(aspects): () => Promise<GetFormResponse> {
  const service = getService(aspects);
  return async (): Promise<GetFormResponse> => {
    return service.get({});
  };
}

function getService(aspects) {
  return ServicesServer().FormsService()(aspects);
}

export function updateBookingFormFactory(
  aspects,
): (form: Form) => Promise<UpdateFormResponse> {
  const service = getService(aspects);
  return async (form: Form): Promise<UpdateFormResponse> => {
    const updateFormRequest: UpdateFormRequest = {
      form,
    };
    return service.update(updateFormRequest);
  };
}
