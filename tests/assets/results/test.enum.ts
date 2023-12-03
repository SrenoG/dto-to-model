import { invert } from 'lodash';

export enum TestEnum {
	TEST1 = "TEST1",
	TEST2 = "TEST2",
	TEST3 = "TEST3"
}

export const TestEnumFromDto =  {
	[TestEnumDto.Test1]: TestEnum.TEST1,
	[TestEnumDto.Test2]: TestEnum.TEST2,
	[TestEnumDto.Test3]: TestEnum.TEST3
}

export const TestEnumToDto = invert(TestEnumFromDto) as {
	[key: string]: TestEnumDto
}
