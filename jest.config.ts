import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  // Оставляем трансформацию только для ваших файлов, не для node_modules
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Ключевое: говорим Jest не трогать node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs)/)', // Пробуем разрешить трансформацию только для @nestjs, если отключение не сработает
  ],
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;