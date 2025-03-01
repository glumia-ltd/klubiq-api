export const schema = {
	resources: {
		createProperty: {
			summary: 'Create Property',
			description: 'Create a new property',
			type: 'CreatePropertyDto',
			examples: {
				summary: 'Create Property',
				description: 'Create a new property',
				value: {
					customAmenities: ['pool', 'Laundry'],
					address: {
						city: 'Sofia',
						country: 'Bulgaria',
						postalCode: '1000',
						state: 'Sofia',
						street: 'bul. Vitosha 1',
					},
					categoryId: 1,
					description: 'property description',
					images: {
						imageUrls: [
							'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
						],
					},
					isMultiUnit: false,
					managerUid: '00000000-0000-0000-0000-000000000000',
					name: 'property name',
					note: 'note',
					ownerUid: '00000000-0000-0000-0000-000000000000',
					purposeId: 1,
					statusId: 1,
					tags: ['tag1', 'tag2'],
					typeId: 1,
					units: [
						{
							bedrooms: 1,
							bathrooms: 1,
							description: 'description',
							floor: 1,
							name: 'name',
							rent: 1000,
							size: 100,
							typeId: 1,
						},
					],
					orgUuid: '00000000-0000-0000-0000-000000000000',
				},
			},
		},
		leases: {},
		tenants: {},
	},
};
