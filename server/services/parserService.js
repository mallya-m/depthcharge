const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function extractImports(sourceCode, filePath) {
  const imports = [];
  let ast;
  try {
    ast = parser.parse(sourceCode, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
      ],
      errorRecovery: true,
    });
  } catch (error) {
    console.warn(`Could not parse ${filePath}:`, error.message);
    return [];
  }
  traverse(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      imports.push(importPath);
    },
     CallExpression(path) {
      const { callee, arguments: args } = path.node;

      const isRequireCall =
        callee.type === "Identifier" &&
        callee.name === "require" &&
        args.length > 0 &&
        args[0].type === "StringLiteral";

      if (isRequireCall) {
        imports.push(args[0].value);
      }
    },
  });

   return [...new Set(imports)];
}

function parseFiles(files) {
  return files.map((file) => ({
    path: file.path,
    imports: extractImports(file.content, file.path),
  }));
}

module.exports = { parseFiles, extractImports };