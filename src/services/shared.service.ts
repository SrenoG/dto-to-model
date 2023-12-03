import { readFileSync } from "fs-extra";
import { StringValue } from '../enum';
import { dtoFileExtensions } from "../helpers";
import { FileDetails, PropertyType, StringRef } from "../interfaces";

export function getPropertyWithValue(fileDetails: FileDetails, stringRef: StringRef, tabCount: number, properties: PropertyType[], isEmpty: boolean, isDto: boolean, isModel: boolean, isFake = false) {
	const stringFake = stringFakeBuilder(isModel, isDto);
	properties.forEach((property, index) => {
		addTabulation(stringRef, tabCount);
        stringRef.value += (property.name.replace(StringValue.COLON, StringValue.EMPTY).substring(property.name.lastIndexOf(".") + 1, property.name.length) + ':');
		stringRef.value += StringValue.SPACE;
		if(isEmpty) {
			if(property.type === StringValue.NUMBER || property.type === StringValue.BOOLEAN || property.type === StringValue.STRING ){
				stringRef.value += 'undefined';
			} else {
				stringRef.value += 'null';
			}
		} else {
			property.name = property.name.replace(StringValue.COLON, StringValue.EMPTY);
			if(property.type?.includes(StringValue.TAB) ){
				if(!isFake){
					if(isModel){
						stringRef.value += stringFake + StringValue.DOT +  property.name.replace(StringValue.COLON, StringValue.EMPTY) + StringValue.MAP_VALUE + (property.type.replace(StringValue.TAB, StringValue.EMPTY)) + StringValue.DOT + objectFrom(isModel, isDto) +'(' + StringValue.VALUE + ')' + ')';
					} else if(isDto){
						stringRef.value += stringFake + StringValue.DOT +  property.name.replace(StringValue.COLON, StringValue.EMPTY) + StringValue.MAP_VALUE + StringValue.SPACE + StringValue.VALUE + StringValue.DOT + objectFrom(isModel, isDto) +'()' + ')';
					}
				} else {
					stringRef.value += '[';
					stringRef.value += StringValue.R;
					if(!property.type?.includes(StringValue.STRING)
					&& !property.type?.includes(StringValue.NUMBER)
					&& !property.type?.includes(StringValue.DATE)
					&& !property.type?.includes(StringValue.BOOLEAN)
					&& !property.type?.includes(StringValue.ENUM)){
						readDtoFile(fileDetails, stringRef, false, tabCount + 1, {...property, type: property.type.replace(StringValue.TAB, StringValue.EMPTY)}, isDto, isEmpty, isModel, isFake);
					} else {
						property.type = property.type.replace(StringValue.TAB, StringValue.EMPTY);
						addTabulation(stringRef, tabCount + 1);					
						addPropertyWithValueByType(fileDetails, stringRef, tabCount + 1, property, isDto, isEmpty, isModel, isFake);
					}
					stringRef.value += StringValue.R;
					addTabulation(stringRef, tabCount);
					stringRef.value += ']';
				}
			} else {
				addPropertyWithValueByType(fileDetails, stringRef, tabCount + 1, property, isDto, isEmpty, isModel, isFake);
			}
		}
		if(properties.length -1 !== index){
			stringRef.value += ',';
			stringRef.value += StringValue.R;
		}
	});
}

function readDtoFile(fileDetails: FileDetails, stringRef: StringRef, firstChild: boolean, tabCount: number, property: PropertyType, isDto: boolean, isEmpty: boolean, isModel: boolean, isFake: boolean ) {
	let fileName;
	let filePath;
	let lines;
	const stringFake = stringFakeBuilder(isModel, isDto);
	dtoFileExtensions.some(ext => {
		fileName = kebabize(((property.type) + ext));
		filePath = fileDetails.dtoPath.substring(0, fileDetails.dtoPath.lastIndexOf("\\")+1) + fileName;
		lines = getLinesFromFile(filePath);
		return lines;
	});

	{if(!isFake){
		stringRef.value += property.type + '.fromDto(' + stringFake + StringValue.DOT + property.name + ')';
	}else if(lines) {
		if(!firstChild){
			addTabulation(stringRef, tabCount);
		}
		stringRef.value += '{';
		stringRef.value += StringValue.R;
		getPropertyWithValue(fileDetails, stringRef, tabCount + 1, getPropertiesFromDtoFile(property.name, lines, isDto), isEmpty, isDto, isModel, isFake);
		stringRef.value += StringValue.R;
		addTabulation(stringRef, tabCount);
		stringRef.value += '}';
	} else {
		addTabulation(stringRef, tabCount);
		stringRef.value += '{}';
	}}
}

function getPropertiesFromDtoFile(childObjectName: string, lines: string[], isDto: boolean): PropertyType[] {
	const properties: PropertyType[] = [];
	lines.forEach(line => {
		if (
			!line?.includes('import') 
			&& !line?.includes('*') 
			&& line !== null
			&& line !== StringValue.EMPTY
			&& !line?.includes('export interface')
			&& line !== StringValue.CLOSE){			
				let property = line.replace(' | null', StringValue.EMPTY).replace('null | ', StringValue.EMPTY).replace(StringValue.SEMI_COLON, StringValue.EMPTY)?.trim();
				if(!isDto){
					property = property.replace(StringValue.DTO, StringValue.EMPTY);
				}
				if(property?.includes(StringValue.ARRAY)){
					const propertySplit = property.split(StringValue.ARRAY);
					property = propertySplit[0] + propertySplit[1].replace('>', StringValue.EMPTY).replace(StringValue.SEMI_COLON, StringValue.EMPTY) + StringValue.TAB;
				}
				let cleanProperty = property.replace('?', ' ').replace(';', StringValue.EMPTY);
			let propertyName = cleanProperty.split(':')[0]?.trim();
			let propertyType = cleanProperty.split(':')[1]?.trim()?.replace(StringValue.DTO, StringValue.EMPTY);
			if(propertyName.endsWith(StringValue.DATE)) {
				propertyType = StringValue.DATE;
			}
			properties.push({ name: childObjectName + '.' + propertyName, type: propertyType });		
		}	
	});
	return properties;
}

export function getImport(): string {
	let showingImport: string;
	showingImport = "import { invert } from 'lodash';";
	showingImport += StringValue.R;
	return showingImport;
}

export function getFileDetails(fsPath: string): FileDetails {
	const lastIndex = fsPath.lastIndexOf("\\") + 1;
	const fileName =  fsPath.substring(lastIndex);
	return {
		filePath: fsPath.substring(0, fsPath.lastIndexOf("\\") + 1 ),
		baseName: fileName?.replace('-dto.d.ts', StringValue.EMPTY).replace('.model.ts', StringValue.EMPTY).replace('-dto.ts', StringValue.EMPTY),
		fileName: fileName,
		dtoPath: fsPath
	} as FileDetails;
}

function getLinesFromFile(filePath: string): string[] | null {
	let lines: string[] = [];
	try {
		lines = readFileSync(filePath, {encoding:'utf8'}).split('\n').map(line => line.replace('\r', StringValue.EMPTY));
	} catch {
		return null;
	}
	return lines;
}
function addPropertyWithValueByType(fileDetails: FileDetails, stringRef: StringRef, tabCount: number, property: PropertyType, isDto: boolean, isEmpty: boolean, isModel: boolean, isFake: boolean) {
	const stringFake = stringFakeBuilder(isModel, isDto);
	if(property.type === StringValue.DATE || property.type.includes(StringValue.DATE)){
		if(!isFake){
			stringRef.value += dateFrom(isModel, isDto) + stringFake + '.' +  property.name + ')';
		} else {
			stringRef.value += newDate(isModel, isDto);		
		}
	} else if(property.type.endsWith('Enum') || property.type.endsWith('EnumDto')) {
		if(!isFake){
			stringRef.value += property.type + enumFrom(isModel, isDto) + '[' + stringFake + '.' + property.name + ']';
		} else {
			stringRef.value += 'Object.values(' + (property.type.replace(StringValue.DTO, StringValue.EMPTY) + (isDto ? StringValue.DTO : StringValue.EMPTY)) + ')' + '[0]';
		}
	} else if (property.type === StringValue.BOOLEAN){
		if(!isFake){
			stringRef.value += stringFake + '.' + property.name;
		} else {
			stringRef.value += 'true';
		}
	} else if(property.type === StringValue.STRING){
		if(!isFake){
			stringRef.value += stringFake + '.' +  property.name;
		} else {
			// Set text of string from property name
			const text = property.name.substring(property.name.lastIndexOf(".") + 1, property.name.length);
			stringRef.value += '\'' + (text ?? property.name) + '\'';
		}
	} else if(property.type === StringValue.NUMBER){
		if(!isFake){
			stringRef.value += stringFake + '.' +  property.name;
		} else {
			stringRef.value += '4200';
		}
	}
	else {
		readDtoFile(fileDetails, stringRef, true, tabCount, property, isDto, isEmpty, isModel, isFake);
	}
}

function addTabulation(stringRef: StringRef, tabCount: number) {
	for (let index = 0; index < tabCount; index++) {
		stringRef.value += StringValue.T;
	}
}
export const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());

export function getAllUniqueFromStringList(value: string, index: number, array: string[]) {
	return array.indexOf(value) === index;
}
export function lineTextValid(lineText: string): boolean {
	return lineText !== null && lineText !== '' && !lineText.includes('import') && !lineText.includes('*') && !lineText.includes("//");
}
export const stringFakeBuilder = (isModel: boolean, isDto: boolean) => isModel ? 'fakeDto' : isDto ? 'fakeModel' : 'fake';
export const enumFrom = (isModel: boolean, isDto: boolean) => isModel ? 'FromDto' : isDto ? 'ToDto' : 'Dto';
export const dateFrom = (isModel: boolean, isDto: boolean) => isModel ? StringValue.STRING_TO_DATE : isDto ? StringValue.DATE_TO_STRING : 'Date';
export const newDate = (isModel: boolean, isDto: boolean) =>  isModel ? 'new Date(2020,1,1)' : isDto ? '\'2020-01-01T00:00:00.000Z\'' : 'Date';
export const objectFrom = (isModel: boolean, isDto: boolean) => isModel ? 'fromDto' : isDto ? 'toDto' : 'Dto';