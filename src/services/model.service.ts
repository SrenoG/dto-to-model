import { appendFileSync, copySync, readFileSync, removeSync, writeFileSync } from "fs-extra";
import path from "path";
import { StringValue } from "../enum";
import { dtoFileExtensions } from "../helpers";
import { PropertyType } from '../interfaces/property-type.interface';
import { cleanLineText, getFileDetails, isPrimitiveObject, lineTextValid, packageConfig, stringArrayToTab } from "./shared.service";


export function generateModel(fsPath: string): void {
	const fileDetails = getFileDetails(fsPath);
	if(!dtoFileExtensions.some((x:string) => fileDetails.fileName.endsWith(x))){
		throw new Error('This file isn\'t a valid Dto!');
	} else {
		let destinationPath = "";
		let modelFileName = fileDetails.fileName?.replace('-dto.d', '.model').replace('-dto', '.model');

		const file = fsPath.split(path.sep)
		const apiName = file[file.length - 4];
		const configApi = packageConfig.apis.find(x => x.apiName === apiName)
		if(configApi === null || !configApi?.moveFiles){
			destinationPath = fileDetails.filePath + 'generated' + '-' + fileDetails.baseName + '\\' + modelFileName
		} else {
			const basePath = process.cwd().toString() + "\\" + configApi.destinationModule + "\\" + configApi.destinationDirModel + "\\";
			destinationPath = basePath + modelFileName;
			if(configApi.updateIndex){
				const listExportInFile = readFileSync(basePath + "index.ts", {encoding:'utf8'}).split('\n');
				const appendLine = "export * from './" + path.parse(modelFileName).name + "';\r"
				if(!listExportInFile.some(x => x === appendLine)) {
					appendFileSync(basePath + "index.ts", appendLine, 'utf8')
				}
			}
		}
		copySync(fileDetails.dtoPath, destinationPath);
		let lines;
		try {
			lines = readFileSync(fsPath, {encoding:'utf8'}).split('\n').map(line => line.replace('\r', StringValue.EMPTY));
		} catch {
			throw new Error('file not found:' + fileDetails.fileName);
		}
				
		const modelText = getModelTextFromDocument(lines);

		if(modelText){
			writeFileSync(destinationPath, modelText!);		
		} else {
			removeSync(destinationPath);
			throw new Error('Model not found !');
		}	
	}
}
export function getModelTextFromDocument(lines: string[]): string | null {
	let mainModelName: string = "";
	let showingText:string = "";
	let properties: PropertyType[] = [];
	const lineCount = lines.length;

	for (let index = 0; index < lineCount; index++) {
		const lineText = lines[index];
		if (lineTextValid(lineText)) {
			if (lineText.includes('export interface')) {			
				mainModelName = lineText.split(' ')[2].replace(StringValue.DTO, StringValue.EMPTY);
			} else {
				if(lineText !== StringValue.CLOSE) {
					let isNullable =  lineText.includes('?:');
					let property = cleanLineText(lineText).split(' ')
					let propertyName = property[0];
					let propertyType = property[1];

					if(propertyType?.includes(StringValue.ARRAY)){
						propertyType = stringArrayToTab(propertyType);
						if(propertyType.includes(StringValue.DATE)){
							propertyType = StringValue.DATE
							propertyType = propertyType + StringValue.TAB;
						}
					} else if((propertyName.endsWith(StringValue.DATE) || propertyType.includes(StringValue.DATE))) {
						propertyType = StringValue.DATE;
					}
					properties.push({name: propertyName, type: propertyType, nullable: isNullable});
				}
			}
		} else if(!lineText) {
			showingText +- StringValue.R;
		}
	}
	if(mainModelName) {
		showingText += getModelText(mainModelName, properties);
		showingText += StringValue.R;
		showingText += getConstructor(mainModelName);
		showingText += StringValue.R;
		showingText += getModelFromDto(mainModelName, properties);
		showingText += StringValue.R;
		showingText += getModelToDto(mainModelName, properties);
		showingText += StringValue.R;
	} else {
		return null;
	}
	showingText += StringValue.CLOSE;
	return showingText;
}

function getModelText(mainModelName: string, list: PropertyType[]): string {
	let showingTextModel: string = StringValue.EMPTY;
	showingTextModel += 'export class ' + mainModelName + ' ' + StringValue.OPEN;
	showingTextModel += StringValue.R;
	list.forEach(element => {
		showingTextModel += StringValue.T + StringValue.PUBLIC + StringValue.SPACE + element.name + (element.nullable ? '?' : StringValue.EMPTY) + StringValue.COLON + StringValue.SPACE + element.type + StringValue.SEMI_COLON;
		showingTextModel += StringValue.R;
	});
	return showingTextModel;
}

function getConstructor(mainModelName: string): string {
	let showingTextModel: string = StringValue.EMPTY;
	showingTextModel += StringValue.T;
	showingTextModel += 'constructor(base?: Partial<' + mainModelName + '>) {';
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T2;
	showingTextModel += 'Object.assign(this, base);';
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T;
	showingTextModel += StringValue.CLOSE;
	showingTextModel += StringValue.R;
	return showingTextModel;
}

function getModelFromDto(mainModelName: string, properties: PropertyType[]): string {
	let showingTextModel: string = StringValue.EMPTY;
	showingTextModel += StringValue.T;
	showingTextModel += 'public static fromDto(dto: ' + mainModelName + StringValue.DTO + '): ' + mainModelName + ' ' + StringValue.OPEN;
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T2;
	showingTextModel +=  'return new ' + mainModelName + '({';
	showingTextModel += StringValue.R;
	properties.forEach((property, index) => {	
		showingTextModel += StringValue.T3;
		const firstPartText = property.name + StringValue.COLON + StringValue.SPACE + StringValue.LOWER_DTO + StringValue.DOT + property.name;
		if(property.type?.includes(StringValue.TAB)){
			let propertyType = property.type.replace(StringValue.TAB, StringValue.EMPTY);
			if([StringValue.STRING.toString(), StringValue.NUMBER.toString(), StringValue.BOOLEAN.toString()]?.includes(propertyType)){
				showingTextModel += firstPartText + StringValue.ELSE_EMPTY_ARRAY;
			} else if(propertyType?.includes(StringValue.ENUM)) {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + propertyType + 'FromDto' + '[' + StringValue.VALUE + '])' + StringValue.ELSE_EMPTY_ARRAY;
			} else if (propertyType === StringValue.DATE) {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + StringValue.STRING_TO_DATE + StringValue.VALUE + '))' + StringValue.ELSE_EMPTY_ARRAY;
			} else {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + propertyType + '.fromDto(' + StringValue.VALUE + '))' + StringValue.ELSE_EMPTY_ARRAY;
			}
		} else if(isPrimitiveObject(property.type)){
			showingTextModel += firstPartText;
		} else if(property.type.endsWith(StringValue.ENUM)){
			showingTextModel += firstPartText + StringValue.IF + property.type + 'FromDto' + '[' + StringValue.LOWER_DTO + StringValue.DOT + property.name + ']' + StringValue.ELSE_NULL;
		} else if(property.type === StringValue.DATE){
			showingTextModel += firstPartText + StringValue.IF + StringValue.STRING_TO_DATE + StringValue.LOWER_DTO + StringValue.DOT + property.name + ')' + StringValue.ELSE_NULL;	
		} else {
			showingTextModel += firstPartText + StringValue.IF + property.type + '.fromDto(' + StringValue.LOWER_DTO + StringValue.DOT + property.name + ')' + StringValue.ELSE_NULL;
		}
		if(index !== properties.length - 1) {
			showingTextModel += ',';
		}
		showingTextModel += StringValue.R;
	});
	showingTextModel += StringValue.T2;
	showingTextModel += StringValue.CLOSE + ');';
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T;
	showingTextModel += StringValue.CLOSE;
	showingTextModel += StringValue.R;
	return showingTextModel;
}

function getModelToDto(mainModelName: string, properties: PropertyType[]): string {
	let showingTextModel: string = StringValue.EMPTY;
	const modelLowerCamelCase = (mainModelName.substring(0, 1).toLowerCase() + mainModelName.substring(1));
	showingTextModel += StringValue.T;
	showingTextModel += 'public toDto(): ' + mainModelName + StringValue.DTO + ' ' + StringValue.OPEN;
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T2;
	showingTextModel +=  'const ' + modelLowerCamelCase + StringValue.COLON + StringValue.SPACE + mainModelName + StringValue.DTO + ' = {';
	showingTextModel += StringValue.R;
	properties.forEach((property, index) => {
		const firstPartText = property.name + StringValue.COLON + StringValue.SPACE + StringValue.THIS + StringValue.DOT + property.name;
		showingTextModel += StringValue.T3;
		if(property.type?.includes(StringValue.TAB)){
			property.type = property.type.replace(StringValue.TAB, StringValue.EMPTY);
			if([StringValue.STRING.toString(), StringValue.NUMBER.toString(), StringValue.BOOLEAN].toString()?.includes(property.type)){
				showingTextModel += firstPartText + StringValue.ELSE_EMPTY_ARRAY;
			} else if(property.type?.includes(StringValue.ENUM)) {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + property.type + 'ToDto' + '[' + StringValue.VALUE + '])' + StringValue.COALESCE_NULL;
			} else if (property.type === StringValue.DATE) {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + StringValue.DATE_TO_STRING + StringValue.VALUE + '))' + StringValue.COALESCE_NULL;
			} else {
				showingTextModel += firstPartText + StringValue.MAP_VALUE + StringValue.VALUE + '.toDto()' + ')' + StringValue.COALESCE_NULL;
			}
		} else if([StringValue.STRING.toString(), StringValue.NUMBER.toString(), StringValue.BOOLEAN.toString()]?.includes(property.type)){
			showingTextModel += firstPartText;
		} else if(property.type.endsWith(StringValue.ENUM)){
			showingTextModel += firstPartText + StringValue.IF + property.type + 'ToDto' + '[' + StringValue.THIS + StringValue.DOT + property.name + ']' + StringValue.ELSE_NULL;
		} else if(property.type === StringValue.DATE){
			showingTextModel += firstPartText + StringValue.IF  + StringValue.DATE_TO_STRING + StringValue.THIS + StringValue.DOT + property.name + ')' + StringValue.ELSE_NULL;	
		} else {
			showingTextModel += firstPartText + StringValue.IF + StringValue.THIS + StringValue.DOT + property.name + '.toDto()' + StringValue.ELSE_NULL;
		}
		if(index !== properties.length - 1) {
			showingTextModel += ',';
		}
		showingTextModel += StringValue.R;
	});
	
	showingTextModel += StringValue.T2;
	showingTextModel += StringValue.CLOSE + StringValue.SEMI_COLON;
	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T2;
	showingTextModel += 'return ' + modelLowerCamelCase + StringValue.SEMI_COLON;

	showingTextModel += StringValue.R;
	showingTextModel += StringValue.T;
	showingTextModel += StringValue.CLOSE;
	return showingTextModel;
}


