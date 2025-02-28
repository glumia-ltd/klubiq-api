import { Entity, Column } from 'typeorm';

@Entity('poo.lease_payment_totals') // Replace with the name of your materialized view
export class LeasePaymentTotalView {
	@Column()
	leaseId: string;

	@Column()
	total_paid: number;
}
