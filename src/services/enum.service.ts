import { copySync, readFileSync, removeSync, writeFileSync } from "fs-extra";
import { StringValue } from "../enum";
import { enumFileExtensions } from "../helpers/file.helper";
import { getAllUniqueFromStringList, getFileDetails, getImport } from "./shared.service";

export function generateEnum(fsPath: string): void {
	const fileDetails = getFileDetails(fsPath);
	if(!enumFileExtensions.some(x => fileDetails.fileName.endsWith(x))){
		throw new Error('This file isn\'t a valid Enum Dto!');
	} else {
		let enumFileName = fileDetails.fileName?.replace('-enum-dto.d', '.enum').replace('-enum-dto', '.enum');
		const baseDestPath = fileDetails.filePath + 'generated' + '-' + fileDetails.baseName + '\\';
		const fullDestPath = baseDestPath + enumFileName;
		copySync(fileDetails.dtoPath, fullDestPath);
		let lines;
		try {
			lines = readFileSync(fullDestPath, {encoding:'utf8'}).split('\n').map(line => line.replace('\r', StringValue.EMPTY));
		} catch {
			throw new Error('file not found:' + fileDetails.fileName);
		}
		const enumText = getEnumTextFromDocument(lines!);

		if(enumText){
			writeFileSync(fullDestPath, enumText!);
										
		} else {
			removeSync(baseDestPath);
			throw new Error('Give a name for your enum !');
		}
	}
}
export function getEnumTextFromDocument(lines: string[], sort = true): string |null {
	let enumName: string = "";
	let showingText:string = "";

	const lineCount = lines.length;
	let list: string[] = [];

	for (let index = 0; index < lineCount; index++) {
		const lineText = lines[index];
		if (lineText) {
			if (lineText.includes('Enum')) {
				const lineTextEnumName = lineText
					.split(' ')
					?.find(x => x?.includes('Enum'))
					?.replace('Dto', "")
					?.replace('"', "")
					?.trim();
				enumName = lineTextEnumName 
							? lineTextEnumName!.charAt(0).toUpperCase() + lineTextEnumName!.slice(1) 
							: "";
			}
			else if (!lineText.includes("}") && !lineText.includes("*") && !lineText.includes("//")) {
				let textToShow: string;
				const splitText = lineText.split("=")[1]
					?.replace(/([",',\,,=]+)/g, "")
					?.trim();
				if (splitText) {
					textToShow = splitText;
				} else {
					textToShow = lineText
					?.replace(/([",',\,]+)/g, "")
					?.trim();
				}
				list.push(textToShow);
			}
		}
	}		
	list = list.filter(getAllUniqueFromStringList);
	if(sort) {
		list.sort();
	}
	if(enumName) {
		showingText = getImport();
		showingText += StringValue.R;
		showingText += getEnumText(enumName, list);
		showingText += StringValue.R;
		showingText += getEnumFromDto(enumName, list);
		showingText += StringValue.R;
		showingText += getEnumToDto(enumName);
	} else {
		return null;
	}
	return showingText;
}

export function getEnumText(enumName: string, enumList: string[]): string {
	let showingTextEnum: string;
	showingTextEnum = "export enum " + enumName + ' {' + StringValue.R;
	const lastIndex= enumList.length - 1;
	enumList.forEach((word, index) => {
		const isLast = index === lastIndex;
		const endChar = isLast ? StringValue.EMPTY : ',';
		const wordFormated = word.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
		showingTextEnum += StringValue.T + wordFormated + " = " + `"${wordFormated}"` + endChar + StringValue.R; 
	});
	showingTextEnum += "}" + StringValue.R;
	return showingTextEnum;
}

export function getEnumFromDto(enumName: string, enumList: string[]): string {
	let showingTextEnum: string;
	showingTextEnum = "export const " + enumName + "FromDto" + " = " + ' {' + StringValue.R;
	const lastIndex= enumList.length - 1;
	enumList.forEach((word, index) => {
		const isLast = index === lastIndex;
		const endChar = isLast ? StringValue.EMPTY : ',';
		const wordCaptializeFirst = word.charAt(0).toUpperCase() + word.slice(1);	
		const wordDto = "[" + enumName + "Dto" + "." + wordCaptializeFirst + "]";
		const wordEnum = enumName + "." + word.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
		showingTextEnum += StringValue.T + wordDto  + ": " + wordEnum + endChar + StringValue.R; 
	});
	showingTextEnum += "}";
	showingTextEnum += StringValue.R;
	return showingTextEnum;
}

export function getEnumToDto(enumName: string): string {
	let showingTextEnum: string;
	showingTextEnum = "export const " + enumName + "ToDto" + " = invert(" + enumName + "FromDto" + ") as " + "{" + StringValue.R;
	showingTextEnum += StringValue.T + "[key: string]: " + enumName + "Dto" + StringValue.R;
	showingTextEnum += "}";
	showingTextEnum += StringValue.R;
	return showingTextEnum;
}