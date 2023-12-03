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
			booleans: null,
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
			booleans: [
				true
			],
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
			enums: fakeDto.enums?.map(value => TestEnumFromDto[value]),
			date: DateHelper.fromUtcStringToDate(fakeDto.date),
			dates: fakeDto.dates?.map(value => DateHelper.fromUtcStringToDate(value)),
			dateNullable: DateHelper.fromUtcStringToDate(fakeDto.dateNullable),
			dateNullables: fakeDto.dateNullables?.map(value => DateHelper.fromUtcStringToDate(value)),
			boolean: fakeDto.boolean,
			booleans: fakeDto.booleans,
			myTestObj: TestObject.fromDto(fakeDto.myTestObj),
			myTestObjs: fakeDto.myTestObjs?.map(value => TestObject.fromDto(value))
		});
		expect(Test.fromDto(fakeDto)).toEqual(expectedModelInstance);
	});

	it('should convert model to dto instance - Case dto not empty', () => {
		const fakeModel = new Test({
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
			boolean: true,
			booleans: [
				true
			],
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
			enums: fakeModel.enums?.map(value => TestEnumToDto[value]),
			date:  DateHelper.fromDateToString(fakeModel.date),
			dates: fakeModel.dates?.map(value =>  DateHelper.fromDateToString(value)),
			dateNullable:  DateHelper.fromDateToString(fakeModel.dateNullable),
			dateNullables: fakeModel.dateNullables?.map(value =>  DateHelper.fromDateToString(value)),
			boolean: fakeModel.boolean,
			booleans: fakeModel.booleans,
			myTestObj: TestObject.fromDto(fakeModel.myTestObj),
			myTestObjs: fakeModel.myTestObjs?.map(value => value.toDto())
		};
		expect(Test.toDto(fakeModel)).toEqual(expectedDtoInstance);
	});
})