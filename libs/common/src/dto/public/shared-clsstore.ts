import { ActiveUserData } from '@app/auth/types/firebase.types';
import { ClsStore } from 'nestjs-cls';

export interface SharedClsStore extends ClsStore {
	clientName: string;
	jwtToken: string;
	currentUser: ActiveUserData;
	requestUrl: string;
	clientTimeZoneOffset: number;
	clientTimeZoneName: string;
}
