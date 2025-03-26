use oxc::allocator::Allocator;
use oxc::ast::ast::{CallExpression, Expression};
use oxc_traverse::{Ancestor, Traverse, TraverseCtx};

pub struct PigmentTraverse<'a> {
  allocator: &'a Allocator,
}

impl<'a> PigmentTraverse<'a> {
  pub fn new(allocator: &'a Allocator) -> Self {
    Self { allocator }
  }
}

impl<'a> Traverse<'a> for PigmentTraverse<'a> {
  fn enter_call_expression(&mut self, call_expression: &mut CallExpression<'a>, ctx: &mut TraverseCtx<'a>) {
    let parent = ctx.parent();
    // Do not check further if call expression is a tag of tagged template literal, ie, css(metadata)``;
    if let Ancestor::TaggedTemplateExpressionTag(_tag) = parent {
      return;
    }
  }

  fn enter_tagged_template_expression(
    &mut self,
    node: &mut oxc_ast::ast::TaggedTemplateExpression<'a>,
    ctx: &mut TraverseCtx<'a>,
  ) {
    let tag = &node.tag;

    match tag {
      Expression::Identifier(identifier) => {
        let name = identifier.name.as_str();

        if name == "css" {
          dbg!(name);
        }
      }
      _ => {}
    }
  }
}
