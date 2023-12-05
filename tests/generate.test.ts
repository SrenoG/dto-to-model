import { readFileSync } from 'fs-extra';
import * as src from '../src';

const basePath = process.cwd().toString() + '\\tests\\assets\\';
const dtosPath = basePath + 'dtos\\test-api\\api\\test\\';
const checkedResultPath = basePath + "results\\"
const resultsModelPath = basePath + 'test\\models\\';
const resultsSpecPath = basePath + 'test\\specs\\';

test('generate Enum', () => {
    src.generateEnum(dtosPath + 'test-enum-dto.d.ts')
    const checkedResultText = JSON.stringify(readFileSync(checkedResultPath + 'test.enum.ts', {encoding:'utf8'}));
    const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test-enum\\' + 'test.enum.ts', {encoding:'utf8'}));
    expect(checkedResultText).toBe(resultText);
});

test('generate Model', () => {
  src.generateModel(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(checkedResultPath + 'test.model.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(resultsModelPath + 'test.model.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

test('generate Mocks', () => {
  src.generateMocks(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(checkedResultPath + 'test.mock.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(dtosPath + 'generated-test\\' + 'test.mock.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

test('generate Specs', () => {
  src.generateSpecs(dtosPath + 'test-dto.d.ts')
  const checkedResultText = JSON.stringify(readFileSync(checkedResultPath + 'test.spec.ts', {encoding:'utf8'}));
  const resultText = JSON.stringify(readFileSync(resultsSpecPath + 'test.spec.ts', {encoding:'utf8'}));
  expect(checkedResultText).toBe(resultText);
});

