import { readFileSync } from 'fs-extra';
import * as src from '../src';

const basePath = 'C:\\Users\\t19aqn\\source\\repos\\DEV\\PROJECTS\\TESTING\\dto-to-model\\tests\\';
const dtosPath = basePath + 'assets\\dtos\\';
const resultsPath = basePath + 'assets\\results\\';

test('generate Enum', () => {
    src.generateEnum(dtosPath + 'test-enum-dto.d.ts')
    const checkedResultText = JSON.stringify(readFileSync(resultsPath + 'test.enum.ts', {encoding:'utf8'}));
    const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test-enum\\' + 'test.enum.ts', {encoding:'utf8'}));
    expect(checkedResultText).toBe(resultText);
});

test('generate Model', () => {
  src.generateModel(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(resultsPath + 'test.model.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test\\' + 'test.model.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

test('generate Mocks', () => {
  src.generateMocks(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(resultsPath + 'test.mock.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test\\' + 'test.mock.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

test('generate Specs', () => {
  src.generateSpecs(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(resultsPath + 'test.spec.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test\\' + 'test.spec.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

