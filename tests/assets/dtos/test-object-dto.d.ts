export interface TestObjectDto {
    number?: null | number;
    numbers?: Array<number>;
    string?: null | string;
    strings?: Array<string>;
    enum?: TestEnumDto;
    enums?: Array<TestEnumDto>;
    date?: Date;
    dates?: Array<Date>;
    dateNullable?: null | DateNullableDto;   
    dateNullables?: Array<DateNullableDto>;   
    boolean?: boolean;
    booleans?: Array<boolean>;
}
