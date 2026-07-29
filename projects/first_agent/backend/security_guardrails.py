import ast
import os
from typing import Tuple, List, Optional

# List of blocked modules that are considered dangerous for untrusted execution
BLOCKED_MODULES = {
    'os', 'sys', 'subprocess', 'shutil', 'socket', 'pty', 'platform', 
    'ctypes', 'importlib', 'builtins', 'requests', 'urllib', 'http', 'tempfile'
}

# List of builtins/functions that are strictly forbidden
BLOCKED_FUNCTIONS = {
    'exec', 'eval', 'globals', 'locals', '__import__', 'compile',
    'getattr', 'setattr', 'delattr', 'input', 'breakpoint', 'open'
}

# Forbidden attributes that are often used in sandbox escapes
BLOCKED_ATTRIBUTES = {
    '__subclasses__', '__globals__', '__code__', '__builtins__', 
    '__class__', '__bases__', '__mro__', '__dict__'
}

def analyze_py_code(code: str) -> Tuple[bool, List[str]]:
    violations = []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, [f"Syntax Error during parsing: {str(e)}"]

    class SecurityVisitor(ast.NodeVisitor):
        def visit_Import(self, node: ast.Import):
            for alias in node.names:
                base_module = alias.name.split('.')[0]
                if base_module in BLOCKED_MODULES:
                    violations.append(f"Forbidden module import: '{alias.name}'")
            self.generic_visit(node)

        def visit_ImportFrom(self, node: ast.ImportFrom):
            if node.module:
                base_module = node.module.split('.')[0]
                if base_module in BLOCKED_MODULES:
                    violations.append(f"Forbidden module import: from '{node.module}' import ...")
            self.generic_visit(node)

        def visit_Call(self, node: ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in BLOCKED_FUNCTIONS:
                    violations.append(f"Forbidden function call: '{node.func.id}()'")
            elif isinstance(node.func, ast.Attribute):
                self._check_attribute_access(node.func)
            self.generic_visit(node)

        def visit_Attribute(self, node: ast.Attribute):
            self._check_attribute_access(node)
            self.generic_visit(node)

        def _check_attribute_access(self, node: ast.Attribute):
            if node.attr in BLOCKED_ATTRIBUTES:
                violations.append(f"Forbidden attribute access: '.{node.attr}'")
            if isinstance(node.value, ast.Name):
                obj_name = node.value.id
                if obj_name in BLOCKED_MODULES:
                    violations.append(f"Forbidden call/access to module member: '{obj_name}.{node.attr}'")

    visitor = SecurityVisitor()
    visitor.visit(tree)

    is_safe = len(violations) == 0
    return is_safe, violations


def validate_safe_path(path: str, base_dir: Optional[str] = None) -> str:
    if not path:
        raise ValueError("Path cannot be empty.")
    if base_dir is None:
        base_dir = os.getcwd()
    resolved_base = os.path.realpath(base_dir)
    if not os.path.isabs(path):
        resolved_target = os.path.realpath(os.path.join(resolved_base, path))
    else:
        resolved_target = os.path.realpath(path)
    base_prefix = resolved_base if resolved_base.endswith(os.sep) else resolved_base + os.sep
    target_prefix = resolved_target if resolved_target.endswith(os.sep) else resolved_target + os.sep
    if resolved_target != resolved_base and not target_prefix.startswith(base_prefix):
        raise PermissionError(
            f"Access Denied: Path '{path}' resolves to '{resolved_target}', "
            f"which is outside the permitted boundary '{resolved_base}'."
        )
    sensitive_files = {'.env', 'company.db'}
    target_filename = os.path.basename(resolved_target)
    if target_filename in sensitive_files:
        raise PermissionError(
            f"Access Denied: Read/Write operations on highly sensitive file '{target_filename}' are forbidden."
        )
    return resolved_target
