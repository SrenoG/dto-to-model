import { copyFileSync, readFileSync, removeSync, writeFileSync } from 'fs-extra';
import { StringValue } from '../enum';
import { dtoFileExtensions } from '../helpers';
import { FileDetails, PropertyType, StringRef } from "../interfaces";
import { getFileDetails, getPropertyWithValue, lineTextValid } from "./shared.service";


export function generateMocks(fsPath: string): void {
	const fileDetails = getFileDetails(fsPath);
	if(!dtoFileExtensions.some(x => fileDetails.fileName.endsWith(x))){
		throw new Error('This file isn\'t a valid Dto!');
	} else {
		const mockFileName = fileDetails.fileName?.replace('-dto.d', '.mock').replace('-dto', '.mock');
		const baseDestPath = fileDetails.filePath + 'generated' + '-' + fileDetails.baseName + '\\';
		const fullDestPath = baseDestPath + mockFileName;
		copyFileSync(fileDetails.dtoPath, fullDestPath);
		let lines;
		try {
			lines = readFileSync(fullDestPath, {encoding:'utf8'}).split('\n').map(line => line.replace('\r', StringValue.EMPTY));
		} catch {
			throw new Error('file not found:' + fileDetails.fileName);
		}			
		const mockText = getMocksTextFromDto(fileDetails, lines);
		if (mockText) {
			writeFileSync(fullDestPath, mockText!);		
		} else {
			removeSync(baseDestPath);
			throw new Error('Model not found in model from dto file');
		}							
	}
}

function getMocksTextFromDto(fileDetails: FileDetails, lines: string[]): string | null {
	let mainModelName: string = "";
	let showingText:string = "";
	let properties: PropertyType[] = [];
	const lineCount = lines.length;
	for (let index = 0; index < lineCount; index++) {
		const lineText = lines[index];
		if (lineTextValid(lineText)) {
			if (lineText.includes('export interface')) {			
				mainModelName = lineText.split(' ')[2];
				showingText += 'const' + StringValue.SPACE + 'fake' + mainModelName + StringValue.COLON + StringValue.SPACE + mainModelName + StringValue.SPACE + '=' + StringValue.SPACE + '{';
				showingText += StringValue.R;
			} else {
				if(![StringValue.TO_DTO_STRING.toString(), StringValue.FROM_DTO_STRING.toString(), StringValue.CLOSE.toString()].some(x => lineText.includes(x))) {
					const cleanString = lineText
						.replace(StringValue.PUBLIC + ' ', StringValue.EMPTY)
						.replace('?', StringValue.EMPTY)
						.replace(StringValue.SEMI_COLON, StringValue.EMPTY)
						.replace('null | ', StringValue.EMPTY)
						.replace(' | null', StringValue.EMPTY)
						?.trim();
					let propertyName = cleanString.split(' ')[0];
					let propertyType = cleanString.split(' ')[1].replace(StringValue.DTO, StringValue.EMPTY);
					if(propertyType?.includes(StringValue.ARRAY)){
						const propertySplit = propertyType.split(StringValue.ARRAY);
						propertyType = propertySplit[0] + propertySplit[1].replace('>', StringValue.EMPTY).replace(StringValue.SEMI_COLON, StringValue.EMPTY)
						if(propertyType.includes(StringValue.DATE)){
							propertyType = StringValue.DATE
						}
						propertyType = propertyType + StringValue.TAB;
					}
					properties.push({name: propertyName, type: propertyType} as PropertyType);					
				}
			}
		}
	}
	if(mainModelName) {
		showingText += getMockFromDto(fileDetails, properties);
		showingText += StringValue.R;
	} else {
		return null;
	}
	showingText += StringValue.CLOSE + StringValue.SEMI_COLON;
	return showingText;
}

function getMockFromDto(fileDetails: FileDetails, properties: PropertyType[]): string {
	let stringRef: StringRef = {value: StringValue.EMPTY};
	getPropertyWithValue(fileDetails, stringRef, 1, properties, false, true, false, true);
	return stringRef.value;
}