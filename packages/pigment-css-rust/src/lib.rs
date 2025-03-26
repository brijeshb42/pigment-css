#![deny(clippy::all)]

use oxc::allocator::Allocator;
use oxc::parser::{ParseOptions, Parser};
use oxc::span::SourceType;
use oxc_semantic::SemanticBuilder;
use oxc_traverse::traverse_mut;

mod traverse;

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn transform(code: String, filename: String) -> Option<String> {
  let allocator = Allocator::default();
  let source_type = SourceType::from_path(&filename).unwrap();
  let parser = Parser::new(&allocator, &code, source_type).with_options(ParseOptions {
    parse_regular_expression: true,
    ..Default::default()
  });
  let mut program = parser.parse();
  if !program.errors.is_empty() {
    return None;
  }
  let semantic = SemanticBuilder::new().with_check_syntax_error(true).build(&program.program);
  let (symbols, _) = semantic.semantic.into_scoping_and_nodes();

  let mut pigment_traverse = traverse::PigmentTraverse::new(&allocator);
  traverse_mut(&mut pigment_traverse, &allocator, &mut program.program, symbols);

  Some(code)
}
