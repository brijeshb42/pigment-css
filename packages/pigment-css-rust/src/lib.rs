#![deny(clippy::all)]

use oxc::allocator::Allocator;
use oxc::parser::{ParseOptions, Parser};
use oxc::span::SourceType;
use oxc_codegen::{CodeGenerator, CodegenOptions};
use oxc_semantic::SemanticBuilder;
use oxc_traverse::traverse_mut;
use std::collections::HashSet;

mod traverse;

#[macro_use]
extern crate napi_derive;

#[napi(object)]
pub struct TransformResult {
  pub is_success: bool,
  pub code: Option<String>,
  pub errors: Vec<String>,
}

#[napi]
pub fn transform(code: String, file_path: String) -> TransformResult {
  let allocator = Allocator::default();
  let source_type = SourceType::from_path(&file_path).unwrap();
  let parser = Parser::new(&allocator, &code, source_type).with_options(ParseOptions {
    parse_regular_expression: true,
    ..Default::default()
  });
  let mut program = parser.parse();
  if !program.errors.is_empty() {
    return TransformResult {
      is_success: false,
      code: None,
      errors: program.errors.iter().map(|e| e.to_string()).collect(),
    };
  }
  let semantic = SemanticBuilder::new()
    .with_check_syntax_error(true)
    .build(&program.program);
  let (scoping, _) = semantic.semantic.into_scoping_and_nodes();

  let mut pigment_traverse = traverse::PigmentTraverse::new(&allocator, &file_path);
  // To be provided through user config
  let mut css_identifiers = HashSet::new();
  css_identifiers.insert("css");
  css_identifiers.insert("globalCss");
  css_identifiers.insert("keyframes");
  let mut react_identifiers = HashSet::new();
  react_identifiers.insert("css");
  react_identifiers.insert("globalCss");
  react_identifiers.insert("styled");
  react_identifiers.insert("keyframes");

  pigment_traverse
    .allowed_imports
    .insert("@pigment-css/css", css_identifiers);
  pigment_traverse
    .allowed_imports
    .insert("@pigment-css/react", react_identifiers);

  traverse_mut(
    &mut pigment_traverse,
    &allocator,
    &mut program.program,
    scoping,
  );

  let code = CodeGenerator::new()
    .with_options(CodegenOptions {
      single_quote: true,
      minify: false,
      ..Default::default()
    })
    .build(&program.program);

  dbg!(&pigment_traverse.imported_identifiers);
  dbg!(&pigment_traverse.identifiers);

  TransformResult {
    is_success: true,
    code: Some(code.code),
    errors: vec![],
  }
}
