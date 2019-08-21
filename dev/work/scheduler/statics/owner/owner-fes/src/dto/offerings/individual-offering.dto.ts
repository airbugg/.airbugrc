import { OfferingDto } from './offering.dto';
import { WorkingDay } from './individual-working-days.dto';

export interface IndividualSchedule {
  startDate: string;
  endDate: string;
  noEndDate: boolean;
  durationInMinutes: number;
  staffAvailability?: WorkingDay[];
}

export interface IndividualOfferingDto extends OfferingDto {
  schedulePolicy: {
    maxParticipantsPerOrder: number;
    displayOnlyNoBookFlow: boolean;
    isBookable: boolean;
    uouHidden: boolean;
    capacity: number;
    minutesBetweenAppointments: number;
    staffMembersIds: string[];
  };
  schedule: IndividualSchedule;
}
