import * as fs from 'fs';
import * as path from 'path';

describe(`Docusaurus:`, () => {
  describe(`Defaults`, () => {
    test(`should render docs`, () => {
      const contents = fs
        .readFileSync(path.join(__dirname, '../out/default/index.md'))
        .toString();
      expect(contents).toMatchSnapshot();
    });

    test(`should render sidebar`, () => {
      const contents = fs
        .readFileSync(
          path.join(__dirname, '../out/default/typedoc-sidebar.cjs'),
        )
        .toString();
      expect(contents).toMatchSnapshot();
    });
  });

  describe(`Global Members`, () => {
    test(`should render docs`, () => {
      const contents = fs
        .readFileSync(path.join(__dirname, '../out/global-members/index.md'))
        .toString();
      expect(contents).toMatchSnapshot();
    });

    test(`should render sidebar`, () => {
      const contents = fs
        .readFileSync(
          path.join(__dirname, '../out/global-members/typedoc-sidebar.cjs'),
        )
        .toString();
      expect(contents).toMatchSnapshot();
    });
  });
});
