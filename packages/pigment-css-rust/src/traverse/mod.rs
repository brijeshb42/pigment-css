use oxc::allocator::{Allocator, Box as ArenaBox};
use oxc::ast::ast::{
  BindingIdentifier, CallExpression, Expression, FormalParameterKind, FunctionType,
  IdentifierReference, ImportDeclaration, ImportDeclarationSpecifier, ImportOrExportKind, Program,
  PropertyKind, Statement, TaggedTemplateExpression, VariableDeclaration, VariableDeclarator,
};
use oxc::ast::NONE;
use oxc::span::SPAN;
use oxc_semantic::SymbolId;
use oxc_traverse::{Ancestor, Traverse, TraverseCtx};
use std::collections::{HashMap, HashSet};

mod slugify;

/// Meta tag used for Pigment CSS transformations
const PIGMENT_META_TAG: &str = "__pigment_meta";

/// A traverser for Pigment CSS that handles theme transformations
pub struct PigmentTraverse<'a> {
  file_path: &'a str,
  /// Maps import sources to their allowed identifiers
  pub allowed_imports: HashMap<&'a str, HashSet<&'a str>>,
  /// Maps symbol IDs to their import information
  imported_identifiers: HashMap<SymbolId, (&'a str, &'a str)>,
  /// Counter for generating unique identifiers
  counter: HashMap<&'a str, u32>,
  identifiers: HashSet<SymbolId>,
  is_inside_relevant_expression: bool,
  pub program_to_evaluate: Option<&'a Program<'a>>,
}

impl<'a> PigmentTraverse<'a> {
  /// Creates a new PigmentTraverse instance
  #[must_use]
  pub fn new(_allocator: &'a Allocator, file_path: &'a str) -> Self {
    Self {
      file_path,
      allowed_imports: HashMap::new(),
      imported_identifiers: HashMap::new(),
      counter: HashMap::new(),
      identifiers: HashSet::new(),
      is_inside_relevant_expression: false,
      program_to_evaluate: None,
    }
  }

  /// Adds an imported identifier to the tracking map
  fn add_imported_identifier(
    &mut self,
    symbol_id: SymbolId,
    import_name: &'a str,
    import_source: &'a str,
  ) {
    self
      .imported_identifiers
      .insert(symbol_id, (import_name, import_source));
  }

  /// Gets and increments the counter for a given import name
  fn get_count_for(&mut self, import_name: &'a str) -> u32 {
    *self.counter.entry(import_name).or_insert(0) += 1;
    self.counter[import_name]
  }

  /// Creates a Pigment meta object for evaluation-time replacement
  fn do_evaltime_replacement(
    &mut self,
    import_name: &'a str,
    import_source: &'a str,
    ctx: &mut TraverseCtx<'a>,
  ) -> Expression<'a> {
    let hash_count = self.get_count_for(import_name);
    let str_to_hash = format!("{}-{}-{}", self.file_path, import_name, hash_count);
    let slug = slugify::slugify(&str_to_hash);

    // Create meta object properties
    let mut meta_properties = ctx.ast.vec();
    meta_properties.push(ctx.ast.object_property_kind_object_property(
      SPAN,
      PropertyKind::Init,
      ctx.ast.property_key_static_identifier(SPAN, "tag"),
      ctx.ast.expression_string_literal(SPAN, import_name, None),
      false,
      false,
      false,
    ));
    meta_properties.push(ctx.ast.object_property_kind_object_property(
      SPAN,
      PropertyKind::Init,
      ctx.ast.property_key_static_identifier(SPAN, "import"),
      ctx.ast.expression_string_literal(SPAN, import_source, None),
      false,
      false,
      false,
    ));

    // Create toString function
    let formal_parameters = ctx.ast.formal_parameters(
      SPAN,
      FormalParameterKind::FormalParameter,
      ctx.ast.vec(),
      NONE,
    );
    let function_body = ctx.ast.function_body(
      SPAN,
      ctx.ast.vec(),
      ctx.ast.vec1(ctx.ast.statement_return(
        SPAN,
        Some(ctx.ast.expression_string_literal(SPAN, slug, None)),
      )),
    );
    let fn_expression = ctx.ast.expression_function(
      SPAN,
      FunctionType::FunctionExpression,
      None,
      false,
      false,
      false,
      NONE,
      NONE,
      formal_parameters,
      NONE,
      Some(function_body),
    );

    // Assemble final object
    let mut properties = ctx.ast.vec();
    properties.push(
      ctx.ast.object_property_kind_object_property(
        SPAN,
        PropertyKind::Init,
        ctx
          .ast
          .property_key_static_identifier(SPAN, PIGMENT_META_TAG),
        ctx.ast.expression_object(SPAN, meta_properties, None),
        false,
        false,
        false,
      ),
    );
    properties.push(ctx.ast.object_property_kind_object_property(
      SPAN,
      PropertyKind::Init,
      ctx.ast.property_key_static_identifier(SPAN, "toString"),
      fn_expression,
      true,
      false,
      false,
    ));

    ctx.ast.expression_object(SPAN, properties, None)
  }

  /// Checks if an expression is a valid tag expression and returns the import info if it is
  fn get_tag_info(
    &self,
    expr: &Expression<'a>,
    ctx: &TraverseCtx<'a>,
  ) -> Option<(&'a str, &'a str)> {
    match expr {
      Expression::Identifier(identifier) => {
        if let Some(symbol_id) = ctx
          .scoping()
          .get_reference(identifier.reference_id())
          .symbol_id()
        {
          if let Some((import_name, import_source)) = self.imported_identifiers.get(&symbol_id) {
            if let Some(import_check) = self.allowed_imports.get(import_source) {
              if import_check.contains(import_name) {
                return Some((import_name, import_source));
              }
            }
          }
        }
      }
      Expression::StaticMemberExpression(static_member_expression) => {
        if let Expression::Identifier(obj_identifier) = &static_member_expression.object {
          if let Some(symbol_id) = ctx
            .scoping()
            .get_reference(obj_identifier.reference_id())
            .symbol_id()
          {
            if let Some((_, import_source)) = self.imported_identifiers.get(&symbol_id) {
              let import_name = &static_member_expression.property.name.as_str();
              if let Some(import_check) = self.allowed_imports.get(import_source) {
                if import_check.contains(import_name) {
                  return Some((import_name, import_source));
                }
              }
            }
          }
        }
      }
      _ => {}
    }
    None
  }

  fn is_relevant_expression(&self, expr: &Expression<'a>, ctx: &TraverseCtx<'a>) -> bool {
    if !matches!(
      expr,
      Expression::TaggedTemplateExpression(_) | Expression::CallExpression(_)
    ) {
      return false;
    }

    // Check if the expression's tag/callee is a valid import
    match expr {
      Expression::TaggedTemplateExpression(tagged) => self.get_tag_info(&tagged.tag, ctx).is_some(),
      Expression::CallExpression(call) => self.get_tag_info(&call.callee, ctx).is_some(),
      _ => false,
    }
  }

  /// Handles call tag processing and returns replacement if needed
  fn handle_call_tag(
    &mut self,
    tag: &Expression<'a>,
    ctx: &mut TraverseCtx<'a>,
  ) -> Option<Expression<'a>> {
    if let Some((import_name, import_source)) = self.get_tag_info(tag, ctx) {
      Some(self.do_evaltime_replacement(import_name, import_source, ctx))
    } else {
      None
    }
  }

  /// Transforms a tagged template expression
  fn transform_tagged_template_expression(
    &mut self,
    tagged_template_expression: ArenaBox<'a, TaggedTemplateExpression<'a>>,
    ctx: &mut TraverseCtx<'a>,
  ) -> Expression<'a> {
    let TaggedTemplateExpression {
      span,
      tag,
      quasi,
      type_arguments,
    } = tagged_template_expression.unbox();

    if let Some(replacement) = self.handle_call_tag(&tag, ctx) {
      return replacement;
    }

    ctx
      .ast
      .expression_tagged_template(span, tag, quasi, type_arguments)
  }

  /// Transforms a call expression
  fn transform_call_expression(
    &mut self,
    call_expression: ArenaBox<'a, CallExpression<'a>>,
    ctx: &mut TraverseCtx<'a>,
  ) -> Expression<'a> {
    let CallExpression {
      span,
      callee,
      arguments,
      type_arguments,
      optional,
      pure: _,
    } = call_expression.unbox();

    // Skip if call expression is a tag of tagged template literal
    if matches!(ctx.parent(), Ancestor::TaggedTemplateExpressionTag(_)) {
      return ctx
        .ast
        .expression_call(span, callee, type_arguments, arguments, optional);
    }

    if let Some(replacement) = self.handle_call_tag(&callee, ctx) {
      return replacement;
    }

    ctx
      .ast
      .expression_call(span, callee, type_arguments, arguments, optional)
  }

  fn cleanup_collected_identifiers(&mut self, ctx: &mut TraverseCtx<'a>) {
    self.is_inside_relevant_expression = false;

    if self.identifiers.is_empty() {
      return;
    }

    // Get the program node from the context
    let program = ctx.root();

    // Create a map to store declarations by symbol ID
    let mut declarations: HashMap<SymbolId, &Statement<'a>> = HashMap::new();

    // First pass: collect all declarations
    for statement in program.body.iter() {
      match statement {
        Statement::VariableDeclaration(decl) => {
          let decl = decl.unbox();
          for declarator in &decl.declaration_list {
            if let Some(id) = &declarator.id {
              if let Some(symbol_id) = id.symbol_id() {
                declarations.insert(symbol_id, statement);
              }
            }
          }
        }
        Statement::FunctionDeclaration(func) => {
          let func = func.unbox();
          if let Some(id) = &func.id {
            if let Some(symbol_id) = id.symbol_id() {
              declarations.insert(symbol_id, statement);
            }
          }
        }
        Statement::ClassDeclaration(class) => {
          let class = class.unbox();
          if let Some(id) = &class.id {
            if let Some(symbol_id) = id.symbol_id() {
              declarations.insert(symbol_id, statement);
            }
          }
        }
        _ => {}
      }
    }

    // Second pass: process tracked identifiers
    for symbol_id in self.identifiers.iter() {
      if let Some(declaration) = declarations.get(symbol_id) {
        match declaration {
          Statement::VariableDeclaration(var_decl) => {
            let var_decl = var_decl.unbox();
            // Find the specific declarator for this symbol
            if let Some(declarator) = var_decl.declaration_list.iter().find(|d| {
              d.id
                .as_ref()
                .and_then(|id| id.symbol_id())
                .map_or(false, |id| id == *symbol_id)
            }) {
              // Process the variable declaration
              if let Some(id) = &declarator.id {
                dbg!(
                  "Found variable declaration for",
                  id.name.as_str(),
                  "with symbol ID",
                  symbol_id
                );
              }
            }
          }
          Statement::FunctionDeclaration(func_decl) => {
            let func_decl = func_decl.unbox();
            if let Some(id) = &func_decl.id {
              dbg!(
                "Found function declaration for",
                id.name.as_str(),
                "with symbol ID",
                symbol_id
              );
            }
          }
          Statement::ClassDeclaration(class_decl) => {
            let class_decl = class_decl.unbox();
            if let Some(id) = &class_decl.id {
              dbg!(
                "Found class declaration for",
                id.name.as_str(),
                "with symbol ID",
                symbol_id
              );
            }
          }
          _ => {}
        }
      } else {
        // If we can't find a declaration, it might be:
        // 1. A parameter
        // 2. A class field
        // 3. A function expression
        // 4. Or something else
        dbg!("No declaration found for symbol ID", symbol_id);
      }
    }

    self.identifiers.clear();
  }
}

impl<'a> Traverse<'a> for PigmentTraverse<'a> {
  /// Collects imported identifiers from allowed imports
  fn enter_import_declaration(
    &mut self,
    import_declaration: &mut ImportDeclaration<'a>,
    _ctx: &mut TraverseCtx<'a>,
  ) {
    if import_declaration.import_kind != ImportOrExportKind::Value {
      return;
    }

    let import_source = import_declaration.source.value.as_str();
    if !self.allowed_imports.contains_key(import_source) {
      return;
    }

    if let Some(specifiers) = &import_declaration.specifiers {
      for specifier in specifiers {
        match specifier {
          ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
            if import_specifier.import_kind == ImportOrExportKind::Type {
              continue;
            }
            self.add_imported_identifier(
              import_specifier.local.symbol_id(),
              import_specifier.imported.name().as_str(),
              import_source,
            );
          }
          ImportDeclarationSpecifier::ImportNamespaceSpecifier(import_specifier) => {
            self.add_imported_identifier(
              import_specifier.local.symbol_id(),
              import_specifier.local.name.as_str(),
              import_source,
            );
          }
          _ => {}
        }
      }
    }
  }

  /// Enters expression to check if it is Pigment relevant expression or not.
  /// If it is, then it sets the boolean `is_inside_relevant_expression` true.
  /// This is done so that we can track the identifiers used inside the expression.
  fn enter_expression(&mut self, node: &mut Expression<'a>, ctx: &mut TraverseCtx<'a>) {
    if !self.is_relevant_expression(node, ctx) {
      return;
    }

    self.is_inside_relevant_expression = true;
  }

  /// If we are inside Pigment relevant expression, and an identifier is encountered that is not one of the Pigment imports, track its symbol id.
  /// This will then be used to track its original statement in the code and copy over to the new ast.
  fn enter_identifier_reference(
    &mut self,
    identifier_reference: &mut IdentifierReference<'a>,
    ctx: &mut TraverseCtx<'a>,
  ) {
    if !self.is_inside_relevant_expression {
      return;
    }

    if let Some(symbol_id) = ctx
      .scoping()
      .get_reference(identifier_reference.reference_id())
      .symbol_id()
    {
      if self.imported_identifiers.contains_key(&symbol_id) {
        return;
      }
      self.identifiers.insert(symbol_id);
    }
  }

  /// If we are inside Pigment relevant expression, then we transform the expression.
  /// We also reset the `is_inside_relevant_expression` boolean to false when we exit
  /// the expression to restart the tracking when the next Pigment relevant expression
  /// is encountered.
  fn exit_expression(&mut self, expr: &mut Expression<'a>, ctx: &mut TraverseCtx<'a>) {
    if !matches!(
      expr,
      Expression::TaggedTemplateExpression(_) | Expression::CallExpression(_)
    ) {
      return;
    }

    *expr = match ctx.ast.move_expression(expr) {
      Expression::TaggedTemplateExpression(e) => {
        self.cleanup_collected_identifiers(ctx);
        self.transform_tagged_template_expression(e, ctx)
      }
      Expression::CallExpression(e) => {
        self.cleanup_collected_identifiers(ctx);
        self.transform_call_expression(e, ctx)
      }
      _ => unreachable!(),
    };
  }
}
