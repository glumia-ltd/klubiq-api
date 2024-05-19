import { ClsStore } from 'nestjs-cls';

export interface SharedClsStore extends ClsStore {
	clientName: string;
	orgId: string;
	jwtToken: string;
}
