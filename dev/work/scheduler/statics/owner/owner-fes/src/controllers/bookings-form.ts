import {
  getBookingFormFactory,
  updateBookingFormFactory,
} from '../adapters/form/form-adapter-rpc';
import {
  getBookingForm,
  updateBookingForm,
} from '../adapters/form/form-adapter';

export async function getBookingsForm(req, res, next, petri) {
  const getterOfBookingFormFactory = getBookingFormFactory(req.aspects);
  const formResponse = await getBookingForm(getterOfBookingFormFactory);
  res.send(formResponse);
}

export async function updateBookingsForm(req, res, next, petri) {
  const updaterOfBookingFormFactory = updateBookingFormFactory(req.aspects);
  const formResponse = await updateBookingForm(
    req.body,
    updaterOfBookingFormFactory,
  );
  res.send({ id: formResponse });
}
