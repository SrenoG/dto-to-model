import { DateHelper } from '@nag/sma/shared';
describe('Test Model', () => {
	it('should create an empty instance (check constructor)', () => {
		const model = new Test();
		expect(model).toBeTruthy();
		expect(model).toBeDefined();
	});

	it('should convert dto to model instance - Case dto empty', () => {
		const fakeEmptyDto = {};
		const expectedEmptyModelInstance = new Test({
			number: undefined,
			numbers: null,
			string: undefined,
			strings: null,
			enum: null,
			enums: null,
			date: null,
			dates: null,
			dateNullable: null,
			dateNullables: null,
			boolean: undefined,
			myTestObj: null,
			myTestObjs: null
		});
		expect(Test.fromDto(fakeEmptyDto)).toEqual(expectedEmptyModelInstance);
	});

	it('should convert dto to model instance - Case dto not empty', () => {
		const fakeDto: TestDto = {
			number: 4200,
			numbers: [
				4200
			],
			string: 'string',
			strings: [
				'strings'
			],
			enum: Object.values(TestEnumDto)[0],
			enums: [
				Object.values(TestEnumDto)[0]
			],
			date: '2020-01-01T00:00:00.000Z',
			dates: [
				'2020-01-01T00:00:00.000Z'
			],
			dateNullable: '2020-01-01T00:00:00.000Z',
			dateNullables: [
				'2020-01-01T00:00:00.000Z'
			],
			boolean: true,
			myTestObj: {
					number: 4200,
					numbers: [
						4200
					],
					string: 'string',
					strings: [
						'strings'
					],
					enum: Object.values(TestEnumDto)[0],
					enums: [
						Object.values(TestEnumDto)[0]
					],
					date: '2020-01-01T00:00:00.000Z',
					dates: [
						'2020-01-01T00:00:00.000Z'
					],
					dateNullable: '2020-01-01T00:00:00.000Z',
					dateNullables: [
						'2020-01-01T00:00:00.000Z'
					],
					boolean: true
				},
			myTestObjs: [
				{
					number: 4200,
					numbers: [
						4200
					],
					string: 'string',
					strings: [
						'strings'
					],
					enum: Object.values(TestEnumDto)[0],
					enums: [
						Object.values(TestEnumDto)[0]
					],
					date: '2020-01-01T00:00:00.000Z',
					dates: [
						'2020-01-01T00:00:00.000Z'
					],
					dateNullable: '2020-01-01T00:00:00.000Z',
					dateNullables: [
						'2020-01-01T00:00:00.000Z'
					],
					boolean: true
				}
			]
		};
		const expectedModelInstance = new Test({
			number: fakeDto.number,
			numbers: fakeDto.numbers,
			string: fakeDto.string,
			strings: fakeDto.strings,
			enum: TestEnumFromDto[fakeDto.enum],
			enums: TestEnumFromDto[fakeDto.enums],
			date: DateHelper.fromUtcStringToDate(fakeDto.date),
			dates: DateHelper.fromUtcStringToDate(fakeDto.dates),
			dateNullable: DateHelper.fromUtcStringToDate(fakeDto.dateNullable),
			dateNullables: DateHelper.fromUtcStringToDate(fakeDto.dateNullables),
			boolean: fakeDto.boolean,
			myTestObj: TestObject.fromDto(fakeDto.myTestObj),
			myTestObjs: fakeDto.myTestObjs?.map(value => TestObject.fromDto(value))
		});
		expect(Test.fromDto(fakeDto)).toEqual(expectedModelInstance);
	});

	it('should convert model to dto instance - Case dto not empty', () => {
		const fakeModel = new Test({
			number: 4200,
			numbers: 4200,
			string: 'string',
			strings: 'strings',
			enum: Object.values(TestEnum)[0],
			enums: Object.values(TestEnum)[0],
			date: new Date(2020,1,1),
			dates: new Date(2020,1,1),
			dateNullable: new Date(2020,1,1),
			dateNullables: new Date(2020,1,1),
			boolean: true,
			myTestObj: {
					number: 4200,
					numbers: [
						4200
					],
					string: 'string',
					strings: [
						'strings'
					],
					enum: Object.values(TestEnum)[0],
					enums: [
						Object.values(TestEnum)[0]
					],
					date: new Date(2020,1,1),
					dates: [
						new Date(2020,1,1)
					],
					dateNullable: new Date(2020,1,1),
					dateNullables: [
						new Date(2020,1,1)
					],
					boolean: true
				},
			myTestObjs: [
				{
					number: 4200,
					numbers: [
						4200
					],
					string: 'string',
					strings: [
						'strings'
					],
					enum: Object.values(TestEnum)[0],
					enums: [
						Object.values(TestEnum)[0]
					],
					date: new Date(2020,1,1),
					dates: [
						new Date(2020,1,1)
					],
					dateNullable: new Date(2020,1,1),
					dateNullables: [
						new Date(2020,1,1)
					],
					boolean: true
				}
			]
		});
		const expectedDtoInstance: TestDto = {
			number: fakeModel.number,
			numbers: fakeModel.numbers,
			string: fakeModel.string,
			strings: fakeModel.strings,
			enum: TestEnumToDto[fakeModel.enum],
			enums: TestEnumToDto[fakeModel.enums],
			date:  DateHelper.fromDateToString(fakeModel.date),
			dates:  DateHelper.fromDateToString(fakeModel.dates),
			dateNullable:  DateHelper.fromDateToString(fakeModel.dateNullable),
			dateNullables:  DateHelper.fromDateToString(fakeModel.dateNullables),
			boolean: fakeModel.boolean,
			myTestObj: TestObject.fromDto(fakeModel.myTestObj),
			myTestObjs: fakeModel.myTestObjs?.map(value =>  value.toDto())
		};
		expect(Test.toDto(fakeModel)).toEqual(expectedDtoInstance);
	});
})