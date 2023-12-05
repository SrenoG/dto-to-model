import { copyFileSync, readFileSync, removeSync, writeFileSync } from "fs-extra";
import path from "path";
import { StringValue } from "../enum";
import { dtoFileExtensions } from "../helpers";
import { FileDetails, PropertyType, StringRef } from "../interfaces";
import { getModelTextFromDocument } from "./model.service";
import { cleanLineText, getFileDetails, getPropertyWithValue, lineTextValid, packageConfig } from "./shared.service";

export function generateSpecs(fsPath: string): void {
	const fileDetails = getFileDetails(fsPath);
	if(!dtoFileExtensions.some(x => fileDetails.fileName.endsWith(x))){
		throw new Error('This file isn\'t a valid Dto!');
	} else {
		
		let destinationPath = "";
		let specFileName = fileDetails.fileName?.replace('-dto.d', '.spec').replace('-dto', '.spec');

		const file = fsPath.split(path.sep)
		const apiName = file[file.length - 4];
		const configApi = packageConfig.apis.find(x => x.apiName === apiName)
		
		if(configApi === null || !configApi?.moveFiles){
			destinationPath = fileDetails.filePath + 'generated' + '-' + fileDetails.baseName + '\\' + specFileName
		} else {
			const basePath = process.cwd().toString() + "\\" + configApi.destinationModule + "\\" + configApi.destinationDirSpec + "\\";
			destinationPath = basePath + specFileName;
		}

		copyFileSync(fileDetails.dtoPath, destinationPath);
		let lines;
		try {
			lines = readFileSync(fileDetails.dtoPath, {encoding:'utf8'}).split('\n').map(line => line.replace('\r', StringValue.EMPTY));
		} catch {
			throw new Error('file not found:' + fileDetails.fileName);
		}	
		const modelString = getModelTextFromDocument(lines);
		if(modelString){					
			const specText = getSpecFromDocument(fileDetails, modelString.split('\n').map(line => line.replace('\r', StringValue.EMPTY)));
			if(specText){
				writeFileSync(destinationPath, specText);
			} else if(!specText && configApi?.moveFiles) {
				removeSync(destinationPath);
				throw new Error('Model not found in model from dto file');
			}
		} else if(!modelString && !configApi?.moveFiles) {
			removeSync(destinationPath);
			throw new Error('Model not found !');
		}						
	}
}

function getSpecFromDocument(fileDetails: FileDetails, lines: string[]): string | null {
	let mainModelName: string = "";
	let showingText:string = "";
	let properties: PropertyType[] = [];
	const lineCount = lines.length;

	for (let index = 0; index < lineCount; index++) {
		const lineText = lines[index];
		if (lineTextValid(lineText)) {
			if (lineText.includes('export class')) {			
				mainModelName = lineText.split(' ')[2];
				showingText += 'describe(\''+ mainModelName + ' Model\', () => {';
				showingText += StringValue.R;
			} else {
				if(lineText.includes(StringValue.PUBLIC) && ![StringValue.TO_DTO_STRING, StringValue.FROM_DTO_STRING].some(x => lineText.includes(x))) {
					const property = lineText.split(StringValue.COLON);
					let propertyName = cleanLineText(property[0]);
					let propertyType = cleanLineText(property[1]);
					properties.push({name: propertyName, type: propertyType} as PropertyType);
				}
			}
		}
	}
	if(mainModelName) {
		showingText += getEmptyInstanceTest(mainModelName);
		showingText += StringValue.R;
		showingText += getTestEmptyDtoTest(fileDetails, mainModelName, properties);
		showingText += StringValue.R;
		showingText += getTestFromDtoDtoNotEmptyTest(fileDetails, mainModelName, properties);
		showingText += StringValue.R;
		showingText += getTestToDtoDtoNotEmptyTest(fileDetails, mainModelName, properties);
		showingText += StringValue.R;
	} else {
		return null;
	}
	showingText += StringValue.CLOSE + ')';

	return showingText;
}

function getEmptyInstanceTest(mainModelName: string) {
	let showingText: string;
	showingText = StringValue.T + 'it(\'should create an empty instance (check constructor)\', () => {';
	showingText += StringValue.R;
	showingText += StringValue.T2 +  'const model = new ' + mainModelName + '();';
	showingText += StringValue.R;
	showingText += StringValue.T2 + 'expect(model).toBeTruthy();';
	showingText += StringValue.R;
	showingText += StringValue.T2 + 'expect(model).toBeDefined();';
	showingText += StringValue.R;
	showingText += StringValue.T + '});';
	showingText += StringValue.R;
	return showingText;
}
function getTestEmptyDtoTest(fileDetails: FileDetails, mainModelName: string, properties: PropertyType[]) {
	let stringRef: StringRef = {value: StringValue.EMPTY};
	stringRef.value = StringValue.T + 'it(\'should convert dto to model instance - Case dto empty\', () => {';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const fakeEmptyDto = {};';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const expectedEmptyModelInstance = new '+ mainModelName + '({';
	stringRef.value += StringValue.R;
	getPropertyWithValue(fileDetails, stringRef, 3, properties, true, false, false);
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + '});';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + 'expect(' + mainModelName + '.fromDto(fakeEmptyDto)).toEqual(expectedEmptyModelInstance);';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T + '});';
	stringRef.value += StringValue.R;
	return stringRef.value;
}

function getTestFromDtoDtoNotEmptyTest(fileDetails: FileDetails, mainModelName: string, properties: PropertyType[]) {
	let stringRef: StringRef = {value: StringValue.EMPTY};
	stringRef.value = StringValue.T + 'it(\'should convert dto to model instance - Case dto not empty\', () => {';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const fakeDto: ' + mainModelName + StringValue.DTO + ' = {';
	stringRef.value += StringValue.R;
	getPropertyWithValue(fileDetails, stringRef, 3, properties, false, true, false, true);
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + '};';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const expectedModelInstance = new '+ mainModelName + '({';
	stringRef.value += StringValue.R;
	getPropertyWithValue(fileDetails, stringRef, 3, properties, false, false, true, false);
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + '});';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + 'expect(' + mainModelName + '.fromDto(fakeDto)).toEqual(expectedModelInstance);';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T + '});';
	stringRef.value += StringValue.R;
	return stringRef.value;
}

function getTestToDtoDtoNotEmptyTest(fileDetails: FileDetails, mainModelName: string, properties: PropertyType[]) {
	let stringRef: StringRef = {value: StringValue.EMPTY};
	stringRef.value = StringValue.T + 'it(\'should convert model to dto instance - Case dto not empty\', () => {';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const fakeModel = new '+ mainModelName + '({';
	stringRef.value += StringValue.R;
	getPropertyWithValue(fileDetails, stringRef, 3, properties, false, false, true, true);
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + '});';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 +  'const expectedDtoInstance: ' + mainModelName + StringValue.DTO + ' = {';
	stringRef.value += StringValue.R;
	getPropertyWithValue(fileDetails, stringRef, 3, properties, false, true, false, false);
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + '};';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T2 + 'expect(' + mainModelName + '.toDto(fakeModel)).toEqual(expectedDtoInstance);';
	stringRef.value += StringValue.R;
	stringRef.value += StringValue.T + '});';
	return stringRef.value;
}