import { readFileSync } from "fs-extra";
import { StringValue } from '../enum';
import { dtoFileExtensions } from "../helpers";
import { FileDetails, PackageConfig, PropertyType, StringRef } from "../interfaces";

export function getPropertyWithValue(fileDetails: FileDetails, stringRef: StringRef, tabCount: number, properties: PropertyType[], isEmpty: boolean, isDto: boolean, isModel: boolean, isFake = false) {
	const stringFake = stringFakeBuilder(isModel, isDto);
	properties.forEach((property, index) => {
		addTabulation(stringRef, tabCount);
        stringRef.value += (property.name.substring(property.name.lastIndexOf(".") + 1, property.name.length) + ':');
		stringRef.value += StringValue.SPACE;
		if(isEmpty) {
			if(property.type === StringValue.NUMBER || property.type === StringValue.BOOLEAN || property.type === StringValue.STRING ){
				stringRef.value += 'undefined';
			} else if(property.type.includes(StringValue.TAB)){
				stringRef.value += StringValue.TAB;
			} else {		
				stringRef.value += 'null';
			}
		} else {
			//TODO: Remove colon from the begining
			if(property.type?.includes(StringValue.TAB) ){
				if(!isFake){
					const name = property.name
					const type = property.type.replace(StringValue.TAB, StringValue.EMPTY);
					if(isModel){
						if(type === StringValue.DATE){
							stringRef.value += getMapString(stringFake, name) + dateFrom(isModel, isDto) + StringValue.VALUE + ')' + ')';
						} else if (type.includes(StringValue.ENUM)) {
							stringRef.value += getMapString(stringFake, name) + type + enumFrom(isModel, isDto) + '[' + StringValue.VALUE + ']' + ')';
						} else if (type === StringValue.NUMBER || type === StringValue.STRING || type === StringValue.BOOLEAN) {
							stringRef.value += stringFake + StringValue.DOT + name
						} else {
							stringRef.value += getMapString(stringFake, name) + type + StringValue.DOT + objectFrom(isModel, isDto) +'(' + StringValue.VALUE + ')' + ')';
						}
					} else if(isDto){
						if(type === StringValue.DATE){
							stringRef.value += getMapString(stringFake, name) + dateFrom(isModel, isDto) + StringValue.VALUE + ')' + ')';
						} else if (type.includes(StringValue.ENUM)) {
							stringRef.value += getMapString(stringFake, name) + type + enumFrom(isModel, isDto)+ '[' + StringValue.VALUE + ']' + ')';
						}else if (type === StringValue.NUMBER || type === StringValue.STRING || type === StringValue.BOOLEAN) {
							stringRef.value += stringFake + StringValue.DOT + name
						}else {
							stringRef.value += getMapString(stringFake, name) + StringValue.VALUE + StringValue.DOT + objectFrom(isModel, isDto) +'()' + ')';
						}
					}
				} else {
					stringRef.value += '[';
					stringRef.value += StringValue.R;
					if(isObjectDto(property.type)){
						readDtoFile(fileDetails, stringRef, false, tabCount + 1, {...property, type: property.type.replace(StringValue.TAB, StringValue.EMPTY)}, isDto, isEmpty, isModel, isFake);
					} else {						
						addTabulation(stringRef, tabCount + 1);					
						addPropertyWithValueByType(fileDetails, stringRef, tabCount + 1, property, isDto, isEmpty, isModel, isFake, true);
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
function addPropertyWithValueByType(fileDetails: FileDetails, stringRef: StringRef, tabCount: number, property: PropertyType, isDto: boolean, isEmpty: boolean, isModel: boolean, isFake: boolean, generateOne: boolean = false) {
	const stringFake = stringFakeBuilder(isModel, isDto);
	let propertyClone = {...property}
	if(generateOne){
		//Remove [] from type because we want to generate only one element in list
		propertyClone.type = propertyClone.type.replace(StringValue.TAB, StringValue.EMPTY);
	}
	if(propertyClone.type === StringValue.DATE || propertyClone.type.includes(StringValue.DATE)){
		if(!isFake){
			stringRef.value += dateFrom(isModel, isDto) + stringFake + '.' +  property.name + ')';
		} else {
			stringRef.value += newDate(isModel, isDto);		
		}
	} else if(propertyClone.type.endsWith('Enum') || propertyClone.type.endsWith('EnumDto')) {
		if(!isFake){
			stringRef.value += propertyClone.type + enumFrom(isModel, isDto) + '[' + stringFake + '.' + propertyClone.name + ']';
		} else {
			stringRef.value += 'Object.values(' + (propertyClone.type.replace(StringValue.DTO, StringValue.EMPTY) + (isDto ? StringValue.DTO : StringValue.EMPTY)) + ')' + '[0]';
		}
	} else if (propertyClone.type === StringValue.BOOLEAN){
		if(!isFake){
			stringRef.value += stringFake + '.' + propertyClone.name;
		} else {
			stringRef.value += 'true';
		}
	} else if(propertyClone.type === StringValue.STRING){
		if(!isFake){
			stringRef.value += stringFake + '.' +  propertyClone.name;
		} else {
			// Set text of string from property name
			const text = propertyClone.name.substring(property.name.lastIndexOf(".") + 1, propertyClone.name.length);
			stringRef.value += '\'' + (text ?? propertyClone.name) + '\'';
		}
	} else if(propertyClone.type === StringValue.NUMBER){
		if(!isFake){
			stringRef.value += stringFake + '.' +  propertyClone.name;
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

export function getAllUniqueFromStringList(value: string, index: number, array: string[]) {
	return array.indexOf(value) === index;
}
export function lineTextValid(lineText: string): boolean {
	return lineText !== null && lineText !== '' && !lineText.includes('import') && !lineText.includes('*') && !lineText.includes("//");
}

export function removeStringFromString(string: string, toRemove: string[]): string {
	toRemove.forEach(element => {
		string = string.replace(element, StringValue.EMPTY)
	});
	return string;
}

export function cleanLineText(lineText: string) {
	return removeStringFromString(lineText, [
		StringValue.PUBLIC,
		' | null',
		'null | ',
		StringValue.SEMI_COLON,
		StringValue.COLON,
		'?',
		StringValue.DTO
	]).trim()
}

export function stringArrayToTab(propertyType: string): string {
	const propertySplit = propertyType.split(StringValue.ARRAY);
	return propertySplit[0] + propertySplit[1].replace('>', StringValue.EMPTY).replace(StringValue.SEMI_COLON, StringValue.EMPTY) + StringValue.TAB;
}

const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
const stringFakeBuilder = (isModel: boolean, isDto: boolean) => isModel ? 'fakeDto' : isDto ? 'fakeModel' : 'fake';
const enumFrom = (isModel: boolean, isDto: boolean) => isModel ? 'FromDto' : isDto ? 'ToDto' : 'Dto';
const dateFrom = (isModel: boolean, isDto: boolean) => isModel ? StringValue.STRING_TO_DATE : isDto ? StringValue.DATE_TO_STRING : 'Date';
const newDate = (isModel: boolean, isDto: boolean) =>  isModel ? 'new Date(2020,1,1)' : isDto ? '\'2020-01-01T00:00:00.000Z\'' : 'Date';
const objectFrom = (isModel: boolean, isDto: boolean) => isModel ? 'fromDto' : isDto ? 'toDto' : 'Dto';
const getMapString = (stringFake: string, name: string) => stringFake + StringValue.DOT + name + StringValue.MAP_VALUE;

function isObjectDto(propertyType: any) {
	return !propertyType?.includes(StringValue.STRING)
			&& !propertyType?.includes(StringValue.NUMBER)
			&& !propertyType?.includes(StringValue.DATE)
			&& !propertyType?.includes(StringValue.ENUM)
			&& !propertyType?.includes(StringValue.BOOLEAN)
}

export function isPrimitiveObject(type: string): boolean {
	return [StringValue.STRING.toString(), StringValue.NUMBER.toString(), StringValue.BOOLEAN.toString()]?.includes(type)
}

export const packageConfig = require( process.cwd().toString() + "\\dto-to-model.config.json") as PackageConfig;
