# Rollup

## Stage 1

基本的 Bundler + Module 结构

- Bundle 获取入口文件，通过 build 方法返回 Module
- Module 获取源代码 (string)，生成 Ast (acorn)，源码 (magic-string)，所属 Bundle
- Ast 通过 analyse 方法，给每个 statement 新加入源码 (magic-string) 和所属 Module

依赖：

1. acorn: 生成解析 Ast
2. magic-string: 操控源代码, 裁剪源代码

## Stage 2 - Tree Shaking

Step1:

1. 在 Module 中，找到 imports, exports, definitions
2. 在 statement 中， 找到 _dependOn, _defines

Step2:

重构 expandAllStatements
