import { DateHelper } from '@nag/sma/shared';
export class Test {
	public number?: number;
	public numbers?: number[];
	public string?: string;
	public strings?: string[];
	public enum?: TestEnum;
	public enums?: TestEnum[];
	public date?: Date;
	public dates?: Date[];
	public dateNullable?: Date;
	public dateNullables?: Date[];
	public boolean?: boolean;
	public myTestObj: TestObject;
	public myTestObjs: TestObject[];

	constructor(base?: Partial<Test>) {
		Object.assign(this, base);
	}

	public static fromDto(dto: TestDto): Test {
		return new Test({
			number: dto.number,
			numbers: dto.numbers ?? [],
			string: dto.string,
			strings: dto.strings ?? [],
			enum: dto.enum ? TestEnumFromDto[dto.enum] : null,
			enums: dto.enums?.map(value => TestEnumFromDto[value]) ?? [],
			date: dto.date ? DateHelper.fromUtcStringToDate(dto.date) : null,
			dates: dto.dates?.map(value => DateHelper.fromUtcStringToDate(value)) ?? [],
			dateNullable: dto.dateNullable ? DateHelper.fromUtcStringToDate(dto.dateNullable) : null,
			dateNullables: dto.dateNullables?.map(value => DateHelper.fromUtcStringToDate(value)) ?? [],
			boolean: dto.boolean,
			myTestObj: dto.myTestObj ? TestObject.fromDto(dto.myTestObj) : null,
			myTestObjs: dto.myTestObjs?.map(value => TestObject.fromDto(value)) ?? []
		});
	}

	public toDto(): TestDto {
		const test: TestDto = {
			number: this.number,
			numbers: this.numbers ?? [],
			string: this.string,
			strings: this.strings ?? [],
			enum: this.enum ? TestEnumToDto[this.enum] : null,
			enums: this.enums?.map(value => TestEnumToDto[value]) ?? null,
			date: this.date ?  DateHelper.fromDateToString(this.date) : null,
			dates: this.dates?.map(value =>  DateHelper.fromDateToString(value)) ?? null,
			dateNullable: this.dateNullable ?  DateHelper.fromDateToString(this.dateNullable) : null,
			dateNullables: this.dateNullables?.map(value =>  DateHelper.fromDateToString(value)) ?? null,
			boolean: this.boolean,
			myTestObj: this.myTestObj ? this.myTestObj.toDto() : null,
			myTestObjs: this.myTestObjs?.map(value => value.toDto()) ?? null
		};
		return test;
	}
}